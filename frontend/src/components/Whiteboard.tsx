import { useEffect, useState } from "react";

import useAuthStore from "../store/authStore";
import { useParams } from "react-router-dom";

import PDFRenderer from "../components/PDFRenderer";
import Toolbar from "./Toolbar";
import useCanvas from "../hooks/useCanvas";
import useSocketHandlers from "../hooks/useSocketHandlers";
import useBackground from "../hooks/useBackground";
import DrawingCanvas from "./DrawingCanvas";
import useCanvasImages from "../hooks/useCanvasImages";
import { ImageObjType } from "../type/Image";

const Whiteboard = ({ roomName }: { roomName: string }) => {
  const [isErasing, setIsErasing] = useState(false);
  const [imageObjs, setImageObjs] = useState<ImageObjType[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [draggingImageId, setDraggingImageId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [rightClickedImageId, setRightClickedImageId] = useState<string | null>(
    null
  );
  const [contextMenuPos, setContextMenuPos] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const user = useAuthStore((state) => state.user);
  const { id } = useParams();

  const roomId = id!;

  /// 유즈캔버스
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

    isImageDragMode,
    setIsImageDragMode,

    // 🛠 도구 상태
    setIsDrawingMode,
  } = useCanvas({
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
    rightClickedImageId,
    setRightClickedImageId,
    contextMenuPos,
    setContextMenuPos,
  });

  /// 유즈캔버스이미지
  const {
    handleImageUpload,
    handleContextMenu,
    handleDeleteImage,
    isImageUploading,
  } = useCanvasImages(roomId, redrawCanvas, imageObjs, setImageObjs);
  // 유즈캔 백그라운드
  const {
    backgroundUrl,
    setPdfSize,
    handlePdfUpload,
    clearBackground,
    fileName,
  } = useBackground(roomId);

  // 소켓 연결 & 실시간 동기화
  const { userList } = useSocketHandlers({
    roomId,
    setMyStrokes,
    setOtherStrokes,
    setImageObjs,
  });

  const userString =
    userList && userList.length > 0
      ? `${userList.join(", ")} 님(들)이 ${roomName}방에 입장하셨습니다!`
      : "";

  // ctrl + z 누를시 undo() 실행
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "z") undo();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo]);

  useEffect(() => {
    // 캔버스 외부를 클릭했을 때 컨텍스트 메뉴 닫기
    const handleClickOutside = () => {
      setRightClickedImageId(null); // 우클릭된 이미지 ID 초기화
      setContextMenuPos(null); // 컨텍스트 메뉴 위치 초기화
    };

    window.addEventListener("click", handleClickOutside);

    return () => {
      window.removeEventListener("click", handleClickOutside); // 컴포넌트 언마운트 시 이벤트 제거
    };
  }, []);

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
          onUploadPdf={handlePdfUpload}
          onUploadImg={handleImageUpload}
          onClearBackground={clearBackground}
          fileName={fileName}
        />

        {/* 캔버스  + 배경 */}
        <div className="relative w-[1300px] h-[1000px]">
          {isImageUploading && (
            <div className="absolute left-1/2 top-4 transform -translate-x-1/2 bg-white px-4 py-2 rounded shadow text-3xl">
              Img Loading...
            </div>
          )}
          {backgroundUrl?.includes(".pdf") && (
            <PDFRenderer
              url={backgroundUrl}
              onSizeChange={setPdfSize}
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
            handleContextMenu={(e) =>
              handleContextMenu(e, setRightClickedImageId, setContextMenuPos)
            }
            rightClickedImageId={rightClickedImageId}
            contextMenuPos={contextMenuPos}
            setImageObjs={setImageObjs}
            setRightClickedImageId={setRightClickedImageId}
            setContextMenuPos={setContextMenuPos}
            handleDeleteImage={() =>
              handleDeleteImage(
                rightClickedImageId,
                setRightClickedImageId,
                setContextMenuPos
              )
            }
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
