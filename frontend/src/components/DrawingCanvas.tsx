import React, { useEffect } from "react";

interface DrawingCanvasProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  isErasing: boolean;
  handleMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  draw: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  handleHover: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  stopDrawing: () => void;
  redrawCanvas: () => void;
  isImageDragMode: boolean;
}

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
  canvasRef,
  isErasing,
  handleMouseDown,
  draw,
  handleHover,
  stopDrawing,
  redrawCanvas,
  isImageDragMode,
}) => {
  return (
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
      onMouseMove={(e) => {
        draw(e);
        handleHover(e);
      }}
      onMouseUp={stopDrawing}
      onMouseLeave={stopDrawing}
    />
  );
};

export default DrawingCanvas;
