import { useRef, useState, useEffect } from "react";
import useAuthStore from "../store/authStore";
import socket, { connectSocket } from "../utils/socket";

interface User {
  userId: string;
  nickname: string;
}

interface Point {
  x: number;
  y: number;
}

type Stroke = { userId: string; points: Point[] };

interface DrawData {
  userId: string;
  strokes: Stroke[];
}

interface EraseData {
  userId: string;
  x: number;
  y: number;
}

interface ClearData {
  userId: string;
}

const WhiteBoard: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isErasing, setIsErasing] = useState(false);
  const [allStrokes, setAllStrokes] = useState<Stroke[]>([]);
  const user: User | null = useAuthStore((state) => state.user);

  // ✅ 마운트 시 소켓 즉시 연결
  useEffect(() => {
    connectSocket();
  }, []);

  // ✅ 소켓 이벤트 등록
  useEffect(() => {
    socket.on("connect", () => console.log("✅ 소켓 연결됨:", socket.id));

    socket.on("loadDrawings", (savedDrawings: Stroke[]) => {
      if (!savedDrawings || savedDrawings.length === 0) return;
      setAllStrokes(savedDrawings);
    });

    socket.on("draw", (data: DrawData) => {
      setAllStrokes((prevStrokes) => [...prevStrokes, ...data.strokes]);
      console.log("hi", allStrokes);
    });

    socket.on("erase", (data: EraseData) => {
      setAllStrokes((prevStrokes) =>
        prevStrokes.filter(
          (stroke) =>
            !stroke.points.some(
              (point) =>
                Math.abs(point.x - data.x) <= 10 &&
                Math.abs(point.y - data.y) <= 10
            )
        )
      );
    });

    socket.on("clear", (data: ClearData) => {
      setAllStrokes((prevStrokes) =>
        prevStrokes.filter((stroke) => stroke.userId !== data.userId)
      );
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    redrawCanvas();
  }, [allStrokes]);

  // **그리기 시작**
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!user || isErasing) return;
    setIsDrawing(true);
    const { offsetX, offsetY } = e.nativeEvent;
    setAllStrokes((prevStrokes) => [
      ...prevStrokes,
      { userId: user.userId, points: [{ x: offsetX, y: offsetY }] },
    ]);
  };

  // **그리기 중**
  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !user || isErasing) return;
    const { offsetX, offsetY } = e.nativeEvent;
    setAllStrokes((prevStrokes) => {
      const updatedStrokes = [...prevStrokes];
      const lastStroke = updatedStrokes[updatedStrokes.length - 1];
      if (!lastStroke || !Array.isArray(lastStroke.points)) return prevStrokes;
      lastStroke.points.push({ x: offsetX, y: offsetY });
      return updatedStrokes;
    });
  };

  // **그리기 종료**
  const stopDrawing = () => {
    if (!user) return;
    setIsDrawing(false);
    socket.emit("draw", {
      userId: user.userId,
      strokes: [allStrokes[allStrokes.length - 1]],
    });
  };

  // **지우기: 클릭된 위치에서 가까운 선을 삭제**
  const erase = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!user || !isErasing) return;
    const { offsetX, offsetY } = e.nativeEvent;

    setAllStrokes((prevStrokes) => {
      console.log("🖼️ 기존 allStrokes:", prevStrokes);

      const updatedStrokes: Stroke[] = prevStrokes
        .map((stroke) => {
          // ✅ 본인의 선만 삭제 가능하도록 조건 추가
          if (stroke.userId !== user.userId) {
            const newPoints = stroke.points.filter(
              (point) =>
                Math.abs(point.x - offsetX) > 10 ||
                Math.abs(point.y - offsetY) > 10
            );

            // ✅ 지운 후에도 남은 점이 있으면 유지, 없으면 제거
            return newPoints.length > 0
              ? { ...stroke, points: newPoints }
              : null;
          }

          // ✅ 상대방의 선은 그대로 유지
          return stroke;
        })
        .filter((stroke): stroke is Stroke => stroke !== null); // ✅ null 제거

      console.log("🆕 업데이트된 allStrokes:", updatedStrokes);
      return updatedStrokes;
    });

    // 🔥 서버에도 지우기 요청 보내기 (본인의 선만)
    socket.emit("erase", {
      userId: user.userId,
      x: offsetX,
      y: offsetY,
    });
  };

  // **전체 그림 삭제**
  const clearCanvas = () => {
    if (!user) return;
    socket.emit("clear", { userId: user.userId });
  };

  // **캔버스 다시 그리기**
  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    allStrokes.forEach((stroke) => {
      if (!stroke || !Array.isArray(stroke.points)) return;
      ctx.beginPath();
      stroke.points.forEach((point, index) => {
        if (index === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();
    });
  };

  return (
    <div>
      <div className="flex space-x-2 mb-2">
        <button
          onClick={() => setIsErasing(false)}
          className={`m-2 p-2 border rounded ${
            !isErasing ? "bg-blue-500 text-white" : "bg-gray-300"
          }`}
        >
          🖊️ 그리기 모드
        </button>
        <button
          onClick={() => setIsErasing(true)}
          className={`m-2 p-2 border rounded ${
            isErasing ? "bg-red-500 text-white" : "bg-gray-300"
          }`}
        >
          🧹 지우기 모드
        </button>
        <button
          onClick={clearCanvas}
          className="m-2 p-2 border rounded bg-red-500 text-white"
        >
          ❌ 전체 지우기
        </button>
      </div>
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="border border-black"
        onMouseDown={isErasing ? erase : startDrawing} // ✅ 지우기는 클릭 시 실행
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      />
    </div>
  );
};

export default WhiteBoard;
