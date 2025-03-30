import React, { useEffect } from "react";
type ImageObjType = {
  img: HTMLImageElement;
  x: number;
  y: number;
  isDragging: boolean;
  id: string;
};
interface DrawingCanvasProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  isErasing: boolean;
  handleMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  draw: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  handleHover: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  stopDrawing: () => void;
  redrawCanvas: () => void;
  handleDeleteImage: () => Promise<void>;
  isImageDragMode: boolean;
  handleContextMenu: (e: React.MouseEvent<HTMLCanvasElement>) => void; //
  rightClickedImageId: string | null;
  contextMenuPos: { x: number; y: number } | null;
  setImageObjs: React.Dispatch<React.SetStateAction<ImageObjType[]>>;
  setRightClickedImageId: React.Dispatch<React.SetStateAction<string | null>>;
  setContextMenuPos: React.Dispatch<
    React.SetStateAction<{ x: number; y: number } | null>
  >;
}

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
  canvasRef,
  isErasing,
  handleMouseDown,
  draw,
  handleHover,
  stopDrawing,

  contextMenuPos,

  isImageDragMode,
  handleContextMenu,
  rightClickedImageId,
  handleDeleteImage,
}) => {
  return (
    <>
      <canvas
        ref={canvasRef}
        className={`absolute top-0 left-0 border z-10 ${
          isErasing
            ? "cursor-cell"
            : isImageDragMode
            ? "cursor-move"
            : "cursor-crosshair"
        }`}
        width={1300}
        height={1000}
        onMouseDown={handleMouseDown}
        onContextMenu={handleContextMenu}
        onMouseMove={(e) => {
          draw(e);
          handleHover(e);
        }}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      />

      {contextMenuPos && rightClickedImageId && (
        <div
          className="absolute bg-white border rounded shadow p-2 z-50"
          style={{ top: contextMenuPos.y, left: contextMenuPos.x }}
        >
          <button
            onClick={handleDeleteImage}
            className="text-red-500 hover:underline"
          >
            이미지 삭제
          </button>
        </div>
      )}
    </>
  );
};

export default DrawingCanvas;
