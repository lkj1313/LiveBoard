import { useRef, useState, useEffect } from "react";
import { io } from "socket.io-client";
import useAuthStore from "../store/authStore";

const socket = io("http://localhost:4000");

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
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [allStrokes, setAllStrokes] = useState<Stroke[]>([]);
  const user: User | null = useAuthStore((state) => state.user);

  // 소켓 이벤트 등록
  useEffect(() => {
    socket.on("connect", () => console.log("✅ 소켓 연결됨:", socket.id));

    socket.on("loadDrawings", (savedDrawings: Stroke[]) => {
      if (!savedDrawings || savedDrawings.length === 0) return;
      setAllStrokes(savedDrawings.filter(Boolean));
    });

    socket.on("draw", (data: DrawData) => {
      setAllStrokes((prevStrokes) => [
        ...prevStrokes.filter(Boolean),
        ...data.strokes,
      ]);
    });

    socket.on("erase", (data: EraseData) => {
      setAllStrokes((prevStrokes) =>
        prevStrokes
          .filter(Boolean)
          .map((stroke) => ({
            ...stroke,
            points: stroke.points.filter(
              (point) =>
                Math.abs(point.x - data.x) > 10 ||
                Math.abs(point.y - data.y) > 10
            ),
          }))
          .filter((stroke) => stroke.points.length > 0)
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

  // allStrokes가 변경될 때마다 캔버스 다시 그림
  useEffect(() => {
    redrawCanvas();
    console.log(allStrokes);
  }, [allStrokes]);

  // 마우스 다운 이벤트: 클릭 상태(true) 설정, 그리고 그리기 또는 지우기 시작
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsMouseDown(true);
    if (isErasing) {
      erase(e);
    } else {
      startDrawing(e);
    }
  };

  // 마우스 이동 이벤트: 마우스를 누른 상태에서만 실행
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isMouseDown) {
      if (isErasing) {
        erase(e);
      } else {
        draw(e);
      }
    }
  };

  // 마우스 업/마우스 리브 이벤트: 클릭 상태(false)로 전환 및 그리기 종료
  const handleMouseUp = () => {
    setIsMouseDown(false);
    stopDrawing();
  };

  const handleMouseLeave = () => {
    setIsMouseDown(false);
    stopDrawing();
  };

  // 그리기 시작
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!user || isErasing) return;
    setIsDrawing(true);
    const { offsetX, offsetY } = e.nativeEvent;
    setAllStrokes((prevStrokes) => [
      ...prevStrokes,
      { userId: user.userId, points: [{ x: offsetX, y: offsetY }] },
    ]);
  };

  // 그리기 중
  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !user || isErasing) return;
    const { offsetX, offsetY } = e.nativeEvent;
    setAllStrokes((prevStrokes) => {
      const updatedStrokes = [...prevStrokes.filter(Boolean)];
      const lastStroke = updatedStrokes[updatedStrokes.length - 1];
      if (!lastStroke || !Array.isArray(lastStroke.points)) return prevStrokes;
      lastStroke.points.push({ x: offsetX, y: offsetY });
      return updatedStrokes;
    });
  };

  // 그리기 종료
  const stopDrawing = () => {
    if (!user) return;
    setIsDrawing(false);
    socket.emit("draw", {
      userId: user.userId,
      strokes: [allStrokes[allStrokes.length - 1]],
    });
  };

  const erase = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!user || !isErasing || !isMouseDown) return;
    const { offsetX, offsetY } = e.nativeEvent;

    // 모든 stroke 중에서,
    // stroke 안에 offsetX, offsetY와 거의 같은 좌표를 가진 점이 있으면 그 stroke를 삭제
    setAllStrokes((prevStrokes) =>
      prevStrokes.filter(
        (stroke) =>
          !stroke.points.some(
            (point) =>
              Math.abs(point.x - offsetX) <= 10 &&
              Math.abs(point.y - offsetY) <= 10
          )
      )
    );

    // 서버에도 지우기 이벤트 전송
    socket.emit("erase", {
      userId: user.userId,
      x: offsetX,
      y: offsetY,
    });
  };

  // 전체 그림 삭제
  const clearCanvas = () => {
    if (!user) return;
    socket.emit("clear", { userId: user.userId });
  };

  // 캔버스 다시 그리기
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
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      />
    </div>
  );
};

export default WhiteBoard;
