import React from "react";

interface DrawingCanvasProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  width: number;
  height: number;
  isErasing: boolean;
  handleMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  draw: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  handleHover: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  stopDrawing: () => void;
}

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
  canvasRef,
  width,
  height,
  isErasing,
  handleMouseDown,
  draw,
  handleHover,
  stopDrawing,
}) => {
  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={`absolute top-0 left-0 border border-black z-10 ${
        isErasing ? "cursor-cell" : "cursor-crosshair"
      }`}
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
