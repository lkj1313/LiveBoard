import { useEffect, useRef, useState } from "react";
import socket, { connectSocket } from "../utils/socket";
import useAuthStore from "../store/authStore";
import { useParams } from "react-router-dom";

interface Point {
  x: number;
  y: number;
}

interface Stroke {
  userId: string;
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

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { offsetX, offsetY } = e.nativeEvent;

    if (isErasing) {
      erase(offsetX, offsetY);
      return;
    }

    if (!user) return;

    const newStroke: Stroke = {
      userId: user.userId,
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
    if (currentStrokeRef.current) {
      socket.emit("draw", {
        roomId,
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
          return Math.abs(point.x - x) < 10 && Math.abs(point.y - y) < 10;
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

    socket.on("clear", ({ userId }) => {
      setStrokes((prev) => prev.filter((stroke) => stroke.userId !== userId));
    });

    return () => {
      socket.disconnect();
    };
  }, [roomId]);

  return (
    <div style={{ marginBottom: "10px" }}>
      <button
        onClick={() => setIsErasing(false)}
        style={{
          padding: "8px 12px",
          marginRight: "10px",
          backgroundColor: !isErasing ? "#3b82f6" : "#e5e7eb",
          color: !isErasing ? "#fff" : "#000",
          border: "1px solid #ccc",
          borderRadius: "4px",
        }}
      >
        ✏️ 그리기
      </button>
      <button
        onClick={() => setIsErasing(true)}
        style={{
          padding: "8px 12px",
          backgroundColor: isErasing ? "#ef4444" : "#e5e7eb",
          color: isErasing ? "#fff" : "#000",
          border: "1px solid #ccc",
          borderRadius: "4px",
        }}
      >
        🧹 지우기
      </button>
      <button
        onClick={clearCanvas}
        style={{
          padding: "8px 12px",
          marginLeft: "10px",
          backgroundColor: "#f87171",
          color: "#fff",
          border: "1px solid #ccc",
          borderRadius: "4px",
        }}
      >
        ❌ 전체 지우기
      </button>
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        style={{
          border: "1px solid black",
          cursor: isErasing ? "cell" : "crosshair",
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      />
    </div>
  );
};

export default Whiteboard;
