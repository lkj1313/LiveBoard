import { useEffect, useRef, useState } from "react";
import { socket } from "../utils/socket";

interface Point {
  x: number;
  y: number;
}

interface Stroke {
  userId: string;
  nickname: string;
  points: Point[];
}

interface UseCanvasProps {
  user: { userId: string; nickname: string } | null;
  roomId: string;
}

const useCanvas = ({ user, roomId }: UseCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [hoveredNick, setHoveredNick] = useState<string | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(
    null
  );
  const currentStrokeRef = useRef<Stroke | null>(null);

  const handleMouseDown = (
    e: React.MouseEvent<HTMLCanvasElement>,
    isErasing: boolean
  ) => {
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

    currentStrokeRef.current = newStroke;
    setStrokes((prev) => [...prev, newStroke]);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentStrokeRef.current) return;

    const { offsetX, offsetY } = e.nativeEvent;
    currentStrokeRef.current.points.push({ x: offsetX, y: offsetY });

    setStrokes((prev) => {
      const updated = [...prev];
      const last = updated[updated.length - 1];
      last.points.push({ x: offsetX, y: offsetY });
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
      currentStrokeRef.current = null;
    }
  };

  const erase = (x: number, y: number) => {
    if (!user) return;

    socket.emit("erase", { roomId, userId: user.userId, x, y });

    setStrokes((prev) =>
      prev.filter((stroke) => {
        if (!stroke) return false;
        if (stroke.userId !== user.userId) return true;

        const isNear = stroke.points.some(
          (p) => Math.abs(p.x - x) < 5 && Math.abs(p.y - y) < 5
        );
        return !isNear;
      })
    );
  };

  const clearCanvas = () => {
    if (!user) return;

    setStrokes((prev) => prev.filter((s) => s.userId !== user.userId));

    socket.emit("clear", {
      roomId,
      userId: user.userId,
    });
  };

  const handleHover = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDrawing) return;
    const { offsetX, offsetY } = e.nativeEvent;

    const found = strokes.find((stroke) =>
      stroke.points.some(
        (p) => Math.abs(p.x - offsetX) < 6 && Math.abs(p.y - offsetY) < 6
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

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    strokes.forEach((stroke) => {
      if (!stroke || !stroke.points.length) return;

      ctx.beginPath();
      stroke.points.forEach((point, i) => {
        i === 0 ? ctx.moveTo(point.x, point.y) : ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();
    });
  };

  useEffect(() => {
    redrawCanvas();
  }, [strokes]);

  return {
    canvasRef,
    strokes,
    setStrokes,
    hoveredNick,
    hoverPos,
    handleMouseDown,
    draw,
    stopDrawing,
    handleHover,
    clearCanvas,
    erase,
    redrawCanvas,
  };
};

export default useCanvas;
