import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../utils/firebase";
import { socket } from "../utils/socket";
import { ImageObjType } from "../type/Image";
import { useState } from "react";

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

const useCanvasImages = (
  roomId: string | undefined,
  redrawCanvas: () => void,
  imageObjs: ImageObjType[],
  setImageObjs: React.Dispatch<React.SetStateAction<ImageObjType[]>>
) => {
  const [isImageUploading, setIsImageUploading] = useState(false);
  // ✅ 이미지 업로드
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsImageUploading(true);
    const storageRef = ref(storage, `uploads/${file.name}-${Date.now()}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);

    const img = new Image();
    img.src = url;

    img.onload = async () => {
      const newImage: ImageObjType = {
        id: crypto.randomUUID(),
        img,
        x: 100,
        y: 100,
        isDragging: false,
      };

      setImageObjs((prev) => [...prev, newImage]);
      redrawCanvas();

      try {
        const res = await fetch(`${SERVER_URL}/room/${roomId}/canvasImage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            id: newImage.id,
            url,
            x: newImage.x,
            y: newImage.y,
          }),
        });

        if (!res.ok) {
          const errMsg = await res.text();
          throw new Error(`서버 응답 오류: ${errMsg}`);
        }

        socket.emit("addImage", {
          roomId,
          id: newImage.id,
          url,
          x: newImage.x,
          y: newImage.y,
        });
      } catch (err) {
        console.error("❌ 이미지 저장 에러:", err);
        alert("이미지 저장 중 오류가 발생했습니다. 다시 시도해주세요.");
      } finally {
        setIsImageUploading(false); // ✅ 업로드 완료
      }
    };
  };

  // ✅ 우클릭 시 컨텍스트 메뉴 처리
  const handleContextMenu = (
    e: React.MouseEvent<HTMLCanvasElement>,
    setRightClickedImageId: (id: string | null) => void,
    setContextMenuPos: (pos: { x: number; y: number } | null) => void
  ) => {
    e.preventDefault();
    const { offsetX, offsetY } = e.nativeEvent;

    const clickedImage = imageObjs
      .slice()
      .reverse()
      .find(
        (img) =>
          offsetX >= img.x &&
          offsetX <= img.x + 150 &&
          offsetY >= img.y &&
          offsetY <= img.y + 150
      );

    if (clickedImage) {
      setRightClickedImageId(clickedImage.id);
      setContextMenuPos({ x: clickedImage.x, y: clickedImage.y });
    } else {
      setRightClickedImageId(null);
      setContextMenuPos(null);
    }
  };

  // ✅ 이미지 삭제
  const handleDeleteImage = async (
    rightClickedImageId: string | null,
    setRightClickedImageId: (id: string | null) => void,
    setContextMenuPos: (pos: { x: number; y: number } | null) => void
  ) => {
    if (!rightClickedImageId || !roomId) return;

    try {
      await fetch(`${SERVER_URL}/room/${roomId}/image/${rightClickedImageId}`, {
        method: "DELETE",
        credentials: "include",
      });

      socket.emit("deleteImage", {
        roomId,
        imageId: rightClickedImageId,
      });

      setImageObjs((prev) =>
        prev.filter((img) => img.id !== rightClickedImageId)
      );
    } catch (err) {
      console.error("❌ 이미지 삭제 실패", err);
    } finally {
      setRightClickedImageId(null);
      setContextMenuPos(null);
    }
  };

  return {
    handleImageUpload,
    handleContextMenu,
    handleDeleteImage,
    isImageUploading,
  };
};

export default useCanvasImages;
