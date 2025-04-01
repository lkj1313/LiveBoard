import { useEffect, useRef, useState } from "react";
import { socket } from "../utils/socket";
import Stroke from "../type/Stroke";
const SERVER_URL = import.meta.env.VITE_SERVER_URL;
interface UseCanvasProps {
  user: { userId: string; nickname: string } | null;
  roomId: string;

  imageObjs: ImageObjType[];
  setImageObjs: React.Dispatch<React.SetStateAction<ImageObjType[]>>;

  selectedImageId: string | null;
  setSelectedImageId: React.Dispatch<React.SetStateAction<string | null>>;

  draggingImageId: string | null;
  setDraggingImageId: React.Dispatch<React.SetStateAction<string | null>>;

  dragOffset: { x: number; y: number };
  setDragOffset: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;

  rightClickedImageId: string | null;
  setRightClickedImageId: React.Dispatch<React.SetStateAction<string | null>>;

  contextMenuPos: { x: number; y: number } | null;
  setContextMenuPos: React.Dispatch<
    React.SetStateAction<{ x: number; y: number } | null>
  >;
}

type ImageObjType = {
  img: HTMLImageElement;
  x: number;
  y: number;
  isDragging: boolean;
  id: string;
};

const useCanvas = ({
  user,
  roomId,
  imageObjs,
  setImageObjs,
  selectedImageId,
  setSelectedImageId,
  draggingImageId,
  setDraggingImageId,
  dragOffset,
  setDragOffset,
}: UseCanvasProps) => {
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

  const [isImageDragMode, setIsImageDragMode] = useState(false); // 이미지드래그모드
  const [isDrawingMode, setIsDrawingMode] = useState(true); // 그리기모드인가?

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
    isErasing: boolean,
    isImageDragMode: boolean
  ) => {
    if (!user) return;

    const { offsetX, offsetY } = e.nativeEvent;

    // 공통 이미지 클릭 판별 함수
    const getClickedImage = () => {
      return imageObjs
        .slice() // 복사해서
        .reverse() // z-index 상 위쪽 이미지부터 검사
        .find(
          (img) =>
            offsetX >= img.x &&
            offsetX <= img.x + 150 &&
            offsetY >= img.y &&
            offsetY <= img.y + 150
        );
    };

    // === 1. 이미지 드래그 모드 ===
    if (isImageDragMode) {
      const clickedImage = getClickedImage();

      if (clickedImage) {
        setDraggingImageId(clickedImage.id);
        setImageObjs((prev) =>
          prev.map((el) =>
            el.id === clickedImage.id ? { ...el, isDragging: true } : el
          )
        );
        setDragOffset({
          x: offsetX - clickedImage.x,
          y: offsetY - clickedImage.y,
        });
        setSelectedImageId(clickedImage.id);
      } else {
        setSelectedImageId(null); // 이미지 외부 클릭 시 선택 해제
      }

      return; // ✅ 드래그 모드일 땐 여기서 종료
    }

    // === 2. 지우개 모드 ===
    if (isErasing) {
      erase(offsetX, offsetY);
      return; // ✅ 지우개는 여기서 끝
    }

    // === 3. 손 모드일 때만 이미지 선택/해제 처리 ===

    if (!isImageDragMode && !isErasing && !isDrawingMode) {
      const clickedImage = getClickedImage();
      console.log("드로잉", isDrawingMode);

      if (clickedImage) {
        if (selectedImageId !== clickedImage.id) {
          setSelectedImageId(clickedImage.id);
        }
      } else {
        if (selectedImageId !== null) {
          setSelectedImageId(null); // ⭐ 상태 변경 발생하도록 강제
        }
      }
    }

    // === 4. 드로잉 모드 ===
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

    // 🖼 이미지 드래그 중일 경우
    if (draggingImageId) {
      const draggedImage = imageObjs.find((img) => img.id === draggingImageId);

      if (draggedImage) {
        // ✅ 1. 서버에 위치 저장
        fetch(`${SERVER_URL}/room/${roomId}/image/${draggedImage.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ x: draggedImage.x, y: draggedImage.y }),
        }).catch((err) => console.error("❌ 이미지 위치 저장 실패", err));

        // ✅ 2. 다른 유저에게 위치 이동 알림
        socket.emit("moveImage", {
          roomId,
          imageId: draggedImage.id,
          x: draggedImage.x,
          y: draggedImage.y,
        });
      }

      // ✅ 3. 드래그 상태 초기화
      setImageObjs((prev) =>
        prev.map((img) =>
          img.id === draggingImageId ? { ...img, isDragging: false } : img
        )
      );
      setDraggingImageId(null);
      setDragOffset({ x: 0, y: 0 });
      return;
    }

    // ✏️ 드로잉 중일 경우
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
      if (img.id === selectedImageId) {
        ctx.strokeStyle = "#3B82F6"; // Tailwind의 blue-500
        ctx.lineWidth = 2;
        ctx.strokeRect(img.x - 2, img.y - 2, 154, 154); // 약간 크게 테두리
      }
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
  }, [myStrokes, otherStrokes, imageObjs, selectedImageId]);
  return {
    // 📌 캔버스 참조
    canvasRef,

    // 🖊️ 드로잉 관련
    myStrokes,
    otherStrokes,
    setMyStrokes,
    setOtherStrokes,
    handleMouseDown,
    draw,
    stopDrawing,
    handleHover,
    hoveredNick,
    hoverPos,
    clearCanvas,
    undo,
    redrawCanvas,
    isDrawing,
    setIsDrawing,

    // 🎨 도구 모드
    isDrawingMode,
    setIsDrawingMode,
    isImageDragMode,
    setIsImageDragMode,
  };
};

export default useCanvas;
