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
    // 📌 캔버스 참조
    canvasRef,

    // 🖊️ 드로잉 관련
    myStrokes,
    setMyStrokes,
    otherStrokes,
    setOtherStrokes,
    handleMouseDown,
    draw,
    stopDrawing,
    undo,
    clearCanvas,
    redrawCanvas,

    // 👆 마우스 오버 정보
    hoveredNick,
    hoverPos,
    handleHover,

    // 🖼 이미지 관련
    setImageObjs,
    setSelectedImageId,
    isImageDragMode,
    setIsImageDragMode,

    // 🧭 우클릭 컨텍스트 메뉴
    handleContextMenu,
    rightClickedImageId,
    contextMenuPos, // ✅ 추가
    setRightClickedImageId, // ✅ 추가
    setContextMenuPos, // ✅ 추가
    handleDeleteImage,
    // 🛠 도구 상태
    setIsDrawingMode,
  } = useCanvas({ user, roomId });

  // 배경 (업로드, 사이즈, URL)
  const {
    backgroundUrl,
    setPdfSize,
    handleFileUpload,
    clearBackground,
    fileName,
  } = useBackground(roomId, redrawCanvas, setImageObjs);

  // 소켓 연결 & 실시간 동기화
  const { userList } = useSocketHandlers({
    roomId,
    setMyStrokes,
    setOtherStrokes,
    setImageObjs,
  });
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "z") undo();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo]);

  useEffect(() => {
    const handleClickOutside = () => {
      setRightClickedImageId(null);
      setContextMenuPos(null);
    };

    window.addEventListener("click", handleClickOutside);

    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
  }, []);

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
          isImageDragMode={isImageDragMode}
          onToggleDraw={() => {
            setIsErasing(false);
            setIsImageDragMode(false);
            setIsDrawingMode(true);
            setSelectedImageId(null);
          }}
          onToggleErase={() => {
            setIsErasing(true);
            setIsImageDragMode(false);
            setIsDrawingMode(false);
            setSelectedImageId(null);
          }}
          onToggleImageDragMode={() => {
            setIsErasing(false);
            setIsImageDragMode(true);
            setIsDrawingMode(false);
          }}
          onClear={clearCanvas}
          onUpload={handleFileUpload}
          onClearBackground={clearBackground}
          fileName={fileName}
        />

        {/* 캔버스  + 배경 */}
        <div className="relative w-[1300px] h-[1000px]">
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
            // 📌 캔버스 참조
            canvasRef={canvasRef}
            // 🧽 도구 상태
            isErasing={isErasing}
            isImageDragMode={isImageDragMode}
            // 🖊️ 드로잉 동작 관련
            handleMouseDown={(e) =>
              handleMouseDown(e, isErasing, isImageDragMode)
            }
            draw={draw}
            stopDrawing={stopDrawing}
            redrawCanvas={redrawCanvas}
            // 👆 마우스 호버
            handleHover={handleHover}
            // 🧭 우클릭 메뉴
            handleContextMenu={handleContextMenu}
            rightClickedImageId={rightClickedImageId}
            contextMenuPos={contextMenuPos}
            setImageObjs={setImageObjs}
            setRightClickedImageId={setRightClickedImageId}
            setContextMenuPos={setContextMenuPos}
            handleDeleteImage={handleDeleteImage}
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
