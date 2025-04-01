import { ImageObjType } from "../type/Image";
import Stroke from "../type/Stroke";

export const redrawCanvas = (
  canvas: HTMLCanvasElement,
  imageObjs: ImageObjType[],
  selectedImageId: string | null,
  myStrokes: Stroke[],
  otherStrokes: Stroke[],
  userId: string | undefined
) => {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 이미지 렌더
  imageObjs.forEach((img) => {
    ctx.drawImage(img.img, img.x, img.y, 150, 150);
    if (img.id === selectedImageId) {
      ctx.strokeStyle = "#3B82F6";
      ctx.lineWidth = 2;
      ctx.strokeRect(img.x - 2, img.y - 2, 154, 154);
    }
  });

  // 드로잉 렌더
  [...otherStrokes, ...myStrokes].forEach((stroke) => {
    ctx.beginPath();
    stroke.points.forEach((point, i) => {
      if (i === 0) ctx.moveTo(point.x, point.y);
      else ctx.lineTo(point.x, point.y);
    });
    ctx.strokeStyle = stroke.userId === userId ? "#000" : "#888";
    ctx.stroke();
  });
};
