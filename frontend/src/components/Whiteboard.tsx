import { useEffect, useRef, useState } from "react";
import socket, { connectSocket } from "../utils/socket";
import useAuthStore from "../store/authStore";
import { useParams } from "react-router-dom";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../utils/firebase";
import PDFRenderer from "../components/PDFRenderer";

interface Point {
  x: number;
  y: number;
}

interface Stroke {
  userId: string;
  nickname: string;
  points: Point[];
}

const Whiteboard = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [isErasing, setIsErasing] = useState(false);
  const currentStrokeRef = useRef<Stroke | null>(null); // ✅ 추가
  const user = useAuthStore((state) => state.user);
  const { id: roomId } = useParams();
  const [hoveredNick, setHoveredNick] = useState<string | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(
    null
  );
  const [backgroundUrl, setBackgroundUrl] = useState<string | null>(null);
  const [pdfSize, setPdfSize] = useState({ width: 800, height: 600 });
  console.log(backgroundUrl);
  const handleHover = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDrawing) return; // 그리고 있는 중엔 무시

    const { offsetX, offsetY } = e.nativeEvent;

    const found = strokes.find((stroke) =>
      stroke.points.some(
        (point) =>
          Math.abs(point.x - offsetX) < 6 && Math.abs(point.y - offsetY) < 6
      )
    );

    if (found) {
      setHoveredNick(found.nickname);
      setHoverPos({ x: offsetX, y: offsetY });
    } else {
      setHoveredNick(null);
      setHoverPos(null);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { offsetX, offsetY } = e.nativeEvent;

    if (isErasing) {
      erase(offsetX, offsetY);
      return;
    }

    if (!user) return;

    const newStroke: Stroke = {
      userId: user.userId,
      nickname: user.nickname,
      points: [{ x: offsetX, y: offsetY }],
    };

    currentStrokeRef.current = newStroke; // ✅ 현재 stroke 저장
    setStrokes((prev) => [...prev, newStroke]);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentStrokeRef.current) return;
    const { offsetX, offsetY } = e.nativeEvent;

    currentStrokeRef.current.points.push({ x: offsetX, y: offsetY });

    setStrokes((prevStrokes) => {
      const updated = [...prevStrokes];
      const lastStroke = updated[updated.length - 1];
      lastStroke.points.push({ x: offsetX, y: offsetY });
      return updated;
    });
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (currentStrokeRef.current && user) {
      socket.emit("draw", {
        roomId,
        nickname: user.nickname,
        stroke: currentStrokeRef.current,
      });
      currentStrokeRef.current = null; // ✅ 초기화
    }
  };

  const erase = (x: number, y: number) => {
    if (!user) return;

    socket.emit("erase", {
      roomId,
      userId: user.userId,
      x,
      y,
    });

    setStrokes((prev) =>
      prev.filter((stroke) => {
        // stroke가 없으면 제거
        if (!stroke) return false;

        // 내 선이 아니면 무조건 유지
        if (stroke.userId !== user?.userId) return true;

        // 내 선이면서 클릭 근처에 있는 점이 있으면 제거
        const isNearClick = stroke.points.some((point) => {
          return Math.abs(point.x - x) < 5 && Math.abs(point.y - y) < 5;
        });

        return !isNearClick;
      })
    );
  };

  const clearCanvas = () => {
    if (!user) return;

    setStrokes((prev) =>
      prev.filter((stroke) => stroke.userId !== user.userId)
    );

    socket.emit("clear", {
      roomId,
      userId: user.userId,
    });
  };

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    strokes.forEach((stroke) => {
      if (!stroke || !Array.isArray(stroke.points)) return;
      ctx.beginPath();
      stroke.points.forEach((point, index) => {
        if (index === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      });
      ctx.stroke();
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const storageRef = ref(storage, `uploads/${file.name}-${Date.now()}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    setBackgroundUrl(url);

    // ✅ 서버에 backgroundUrl 저장 요청
    await fetch(`http://localhost:4000/room/${roomId}/background`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ backgroundUrl: url }),
    });
  };

  useEffect(() => {
    redrawCanvas();
  }, [strokes]);

  useEffect(() => {
    connectSocket();

    socket.on("connect", () => {
      console.log("✅ 소켓 연결됨:", socket.id);
      socket.emit("join", roomId);
    });

    socket.on("loadDrawings", (strokes) => {
      console.log("🖼️ 서버로부터 그림 받아옴:", strokes);
      setStrokes(strokes);
    });

    socket.on("draw", (stroke) => {
      setStrokes((prev) => [...prev, stroke]);
    });
    socket.on("erase", ({ userId, x, y }) => {
      setStrokes((prev) =>
        prev.filter((stroke) => {
          if (!stroke) return false;

          // 지운 사람이 그린 stroke만 검사
          if (stroke.userId !== userId) return true;

          // 해당 stroke의 point 중 가까운 게 있다면 제거
          const isNearClick = stroke.points.some(
            (point) => Math.abs(point.x - x) < 5 && Math.abs(point.y - y) < 5
          );

          return !isNearClick;
        })
      );
    });
    socket.on("clear", ({ userId }) => {
      setStrokes((prev) => prev.filter((stroke) => stroke.userId !== userId));
    });

    return () => {
      socket.off("draw");
      socket.off("erase");
      socket.off("clear");
      socket.off("loadDrawings");
      socket.disconnect();
    };
  }, [roomId]);
  useEffect(() => {
    const fetchRoom = async () => {
      const res = await fetch(`http://localhost:4000/room/${roomId}`);
      const data = await res.json();
      if (data.backgroundUrl) {
        setBackgroundUrl(data.backgroundUrl);
      }
    };
    fetchRoom();
  }, [roomId]);
  return (
    <div className="flex flex-col items-start h-full w-full">
      {/* ✅ 버튼 바 영역 - 캔버스 위쪽 */}
      <div className="flex gap-2 mb-4  py-2 bg-white bg-opacity-80 rounded shadow z-10">
        <button
          onClick={() => setIsErasing(false)}
          className={`px-3 py-2 rounded border ${
            !isErasing
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-black border-gray-300"
          }`}
        >
          ✏️ 그리기
        </button>
        <button
          onClick={() => setIsErasing(true)}
          className={`px-3 py-2 rounded border ${
            isErasing
              ? "bg-red-500 text-white"
              : "bg-gray-200 text-black border-gray-300"
          }`}
        >
          🧹 지우기
        </button>
        <button
          onClick={clearCanvas}
          className="px-3 py-2 rounded border bg-red-400 text-white border-gray-300"
        >
          ❌ 전체 지우기
        </button>
        <input
          type="file"
          accept="application/pdf,image/*"
          onChange={handleFileUpload}
          className="px-3 py-2 rounded border border-gray-300 bg-lime-400 text-black"
        />
      </div>

      {/* ✅ 캔버스 + 백그라운드 (하단) */}
      <div className="relative w-[800px] h-[800px]">
        <div className="relative min-h-full">
          {backgroundUrl?.includes(".pdf") ? (
            <PDFRenderer url={backgroundUrl} onSizeChange={setPdfSize} />
          ) : (
            backgroundUrl && (
              <img
                src={backgroundUrl}
                alt="background"
                className="absolute top-0 left-0 w-[800px] h-[600px] object-contain pointer-events-none z-0"
              />
            )
          )}

          <canvas
            ref={canvasRef}
            width={pdfSize.width}
            height={pdfSize.height}
            className={`absolute top-0 left-0 border border-black z-10 ${
              isErasing ? "cursor-cell" : "cursor-crosshair"
            }  overflow-auto`}
            onMouseDown={handleMouseDown}
            onMouseMove={(e) => {
              draw(e);
              handleHover(e);
            }}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
          />

          {/* 호버 닉네임 */}
          {hoveredNick && hoverPos && (
            <div
              className="absolute z-20 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded pointer-events-none whitespace-nowrap"
              style={{ top: hoverPos.y + 10, left: hoverPos.x + 10 }}
            >
              {hoveredNick}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Whiteboard;
