import { useEffect, useRef, useState } from "react";
import { socket } from "../utils/socket";
import Stroke from "../type/Stroke";

interface UseCanvasProps {
  user: { userId: string; nickname: string } | null;
  roomId: string;
}

type ImageObjType = {
  img: HTMLImageElement;
  x: number;
  y: number;
  isDragging: boolean;
  id: string;
};

const useCanvas = ({ user, roomId }: UseCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [myStrokes, setMyStrokes] = useState<Stroke[]>([]);
  const [otherStrokes, setOtherStrokes] = useState<Stroke[]>([]);
  const [undoStack, setUndoStack] = useState<Stroke[][]>([]);
  const [hoveredNick, setHoveredNick] = useState<string | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(
    null
  );
  const currentStrokeRef = useRef<Stroke | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [imageObjs, setImageObjs] = useState<ImageObjType[]>([]);
  const [draggingImageId, setDraggingImageId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  console.log(imageObjs);
  const pushUndoStack = () => {
    if (!user) return;
    setUndoStack((prev) => [...prev, JSON.parse(JSON.stringify(myStrokes))]);
  };

  const undo = () => {
    if (!user) return;
    setUndoStack((prev) => {
      if (prev.length === 0) return prev;
      const copy = [...prev];
      const myPreviousStrokes = copy.pop();
      if (myPreviousStrokes) {
        setMyStrokes(myPreviousStrokes);
        socket.emit("replaceStrokes", {
          roomId,
          strokes: myPreviousStrokes,
        });
      }
      return copy;
    });
  };

  const handleMouseDown = (
    e: React.MouseEvent<HTMLCanvasElement>,
    isErasing: boolean
  ) => {
    if (!user) return;
    const { offsetX, offsetY } = e.nativeEvent;

    for (let i = imageObjs.length - 1; i >= 0; i--) {
      const img = imageObjs[i];
      if (
        offsetX >= img.x &&
        offsetX <= img.x + 150 &&
        offsetY >= img.y &&
        offsetY <= img.y + 150
      ) {
        setDraggingImageId(img.id);
        setImageObjs((prev) =>
          prev.map((el) =>
            el.id === img.id ? { ...el, isDragging: true } : el
          )
        );
        setDragOffset({ x: offsetX - img.x, y: offsetY - img.y });
        return;
      }
    }

    if (isErasing) {
      erase(offsetX, offsetY);
      return;
    }

    pushUndoStack();

    const newStroke: Stroke = {
      userId: user.userId,
      nickname: user.nickname,
      points: [{ x: offsetX, y: offsetY }],
    };

    currentStrokeRef.current = newStroke;
    setMyStrokes((prev) => [...prev, newStroke]);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { offsetX, offsetY } = e.nativeEvent;

    if (draggingImageId) {
      setImageObjs((prev) =>
        prev.map((img) =>
          img.id === draggingImageId
            ? {
                ...img,
                x: offsetX - dragOffset.x,
                y: offsetY - dragOffset.y,
              }
            : img
        )
      );
      return;
    }

    if (!isDrawing || !currentStrokeRef.current) return;
    currentStrokeRef.current.points.push({ x: offsetX, y: offsetY });
    setMyStrokes((prev) => {
      const updated = [...prev];
      const last = updated[updated.length - 1];
      if (last) last.points.push({ x: offsetX, y: offsetY });
      return updated;
    });
  };

  const stopDrawing = () => {
    setIsDrawing(false);

    if (draggingImageId) {
      setImageObjs((prev) =>
        prev.map((img) =>
          img.id === draggingImageId ? { ...img, isDragging: false } : img
        )
      );
      setDraggingImageId(null);
      setDragOffset({ x: 0, y: 0 });
      return;
    }

    if (currentStrokeRef.current && user) {
      socket.emit("draw", {
        roomId,
        stroke: currentStrokeRef.current,
      });
      currentStrokeRef.current = null;
    }
  };

  const erase = (x: number, y: number) => {
    if (!user) return;
    pushUndoStack();
    setMyStrokes((prev) =>
      prev.filter(
        (stroke) =>
          !stroke.points.some(
            (p) => Math.abs(p.x - x) < 10 && Math.abs(p.y - y) < 10
          )
      )
    );
    socket.emit("erase", { roomId, userId: user.userId, x, y });
  };

  const clearCanvas = () => {
    if (!user) return;
    pushUndoStack();
    setMyStrokes([]);
    socket.emit("clear", { roomId, userId: user.userId });
  };

  const handleHover = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDrawing) return;
    const { offsetX, offsetY } = e.nativeEvent;
    const found = [...myStrokes, ...otherStrokes].find((stroke) =>
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

    imageObjs.forEach((img) => {
      ctx.drawImage(img.img, img.x, img.y, 150, 150);
    });

    [...otherStrokes, ...myStrokes].forEach((stroke) => {
      ctx.beginPath();
      stroke.points.forEach((point, i) => {
        if (i === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      });
      ctx.strokeStyle = stroke.userId === user?.userId ? "#000" : "#888";
      ctx.stroke();
    });
  };

  useEffect(() => {
    redrawCanvas();
  }, [myStrokes, otherStrokes, imageObjs]);

  return {
    canvasRef,
    myStrokes,
    otherStrokes,
    setMyStrokes,
    setOtherStrokes,
    hoveredNick,
    hoverPos,
    handleMouseDown,
    draw,
    stopDrawing,
    handleHover,
    clearCanvas,
    undo,
    redrawCanvas,
    imageObjs,
    setImageObjs,
  };
};

export default useCanvas;
