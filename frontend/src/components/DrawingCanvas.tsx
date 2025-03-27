import React, { useEffect } from "react";

interface DrawingCanvasProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  isErasing: boolean;
  handleMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  draw: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  handleHover: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  stopDrawing: () => void;
  redrawCanvas: () => void;
}

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
  canvasRef,
  isErasing,
  handleMouseDown,
  draw,
  handleHover,
  stopDrawing,
  redrawCanvas,
}) => {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    resizeCanvas(); // 초기 설정
    redrawCanvas();
    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);
  return (
    <canvas
      ref={canvasRef}
      className={`absolute top-0 left-0 border-t border-b z-10 w-full h-full ${
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
