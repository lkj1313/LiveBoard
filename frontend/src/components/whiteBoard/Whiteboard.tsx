import { useState } from "react";

import useAuthStore from "../../store/authStore";
import { useParams } from "react-router-dom";

import PDFViewer from "./PDFViewer";
import Toolbar from "./Toolbar";
import useCanvas from "../../hooks/whiteBoard/useCanvas";
import useSocketHandlers from "../../hooks/whiteBoard/useSocketHandlers";
import usePdfImage from "../../hooks/whiteBoard/usePdfImage";
import DrawingCanvas from "./DrawingCanvas";
import useCanvasImages from "../../hooks/whiteBoard/useCanvasImages";
import { ImageObjType } from "../../type/Image";
import useWhiteboardEvents from "../../hooks/whiteBoard/useWhiteboardEvents";

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
  const { pdfUrl, setPdfSize, handlePdfUpload, clearBackground, fileName } =
    usePdfImage(roomId);

  // 소켓 연결 & 실시간 동기화
  const { userList } = useSocketHandlers({
    roomId,
    setMyStrokes,
    setOtherStrokes,
    setImageObjs,
  });

  // ctrl + z 누를시 undo() 실행
  useWhiteboardEvents({
    undo,
    setContextMenuPos,
    setRightClickedImageId,
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
          {pdfUrl?.includes(".pdf") && (
            <PDFViewer
              url={pdfUrl}
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
