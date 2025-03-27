import { useEffect, useState } from "react";

import useAuthStore from "../store/authStore";
import { useParams } from "react-router-dom";

import PDFRenderer from "../components/PDFRenderer";
import Toolbar from "./Toolbar";
import useCanvas from "../hooks/useCanvas";
import useSocketHandlers from "../hooks/useSocketHandlers";
import useBackground from "../hooks/useBackground";
import DrawingCanvas from "./DrawingCanvas";

const Whiteboard = ({ roomName }: { roomName: string }) => {
  const [isErasing, setIsErasing] = useState(false);

  const user = useAuthStore((state) => state.user);
  const { id } = useParams();

  const roomId = id!;

  // ✏️ 그린기 기능 (캔버스 관련 로직 + 상태)
  const {
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
  } = useCanvas({ user, roomId });

  // 배경 (업로드, 사이즈, URL)
  const {
    backgroundUrl,
    setPdfSize,
    handleFileUpload,
    clearBackground,
    fileName,
  } = useBackground(roomId, redrawCanvas, setImageObjs);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "z") undo();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo]);

  // 소켓 연결 & 실시간 동기화
  const { userList } = useSocketHandlers({
    roomId,
    setMyStrokes,
    setOtherStrokes,
  });

  const userString =
    userList && userList.length > 0
      ? `${userList.join(", ")} 님(들)이 ${roomName}방에 입장하셨습니다!`
      : "";

  return (
    <div className="w-full">
      {/* 입장문구 */}
      {userString && (
        <div className="text-sm text-gray-600 text-center py-2">
          {userString}
        </div>
      )}

      <div className="flex flex-col items-center h-full w-full">
        <Toolbar
          isErasing={isErasing}
          onToggleDraw={() => setIsErasing(false)}
          onToggleErase={() => setIsErasing(true)}
          onClear={clearCanvas}
          onUpload={handleFileUpload}
          onClearBackground={clearBackground}
          fileName={fileName}
        />

        {/* 캔버스  + 배경 */}
        <div className="relative w-full h-screen">
          {backgroundUrl?.includes(".pdf") && (
            <PDFRenderer
              url={backgroundUrl}
              onSizeChange={setPdfSize}
              redrawCanvas={redrawCanvas}
              myStrokes={myStrokes}
              otherStrokes={otherStrokes}
            />
          )}

          <DrawingCanvas
            canvasRef={canvasRef}
            isErasing={isErasing}
            handleMouseDown={(e) => handleMouseDown(e, isErasing)}
            draw={draw}
            handleHover={handleHover}
            stopDrawing={stopDrawing}
            redrawCanvas={redrawCanvas}
          />

          {/* Hover 닉네임 */}
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
