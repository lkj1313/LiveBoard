import { useEffect, useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../utils/firebase";
type ImageObjType = {
  img: HTMLImageElement;
  x: number;
  y: number;
  isDragging: boolean;
  id: string;
};

const SERVER_URL = import.meta.env.VITE_SERVER_URL;
const useBackground = (
  roomId: string | undefined,
  redrawCanvas: () => void,
  setImageObjs: React.Dispatch<React.SetStateAction<ImageObjType[]>>
) => {
  const [backgroundUrl, setBackgroundUrl] = useState<string | null>(null);
  const [pdfSize, setPdfSize] = useState({ width: 1000, height: 1000 });
  const [fileName, setFileName] = useState("선택된 파일 없음");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !roomId) return;

    // PDF 파일일 경우 → 배경 업로드
    if (file.type === "application/pdf") {
      const storageRef = ref(storage, `uploads/${file.name}-${Date.now()}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setBackgroundUrl(url);
      setFileName(file.name);

      await fetch(`${SERVER_URL}/room/${roomId}/background`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ backgroundUrl: url }),
      });
      return;
    }

    // 이미지 파일일 경우 → 드래그 가능한 이미지 객체로 캔버스에 추가
    if (file.type.startsWith("image/")) {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const newImage = {
          img,
          x: 100,
          y: 100,
          isDragging: false,
          id: crypto.randomUUID(), // 브라우저 내장 고유 ID 생성기
        };

        setImageObjs((prev) => [...prev, newImage]);
        redrawCanvas();
      };
      return;
    }

    // 기타 허용되지 않은 파일
    alert("PDF 또는 이미지 파일만 업로드할 수 있습니다.");
  };

  const clearBackground = async () => {
    setBackgroundUrl(null); // 화면에서 제거
    setFileName("선택된 파일 없음"); // ✅ 파일명 초기화

    if (!roomId) return;

    await fetch(`${SERVER_URL}/room/${roomId}/background`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ backgroundUrl: null }),
    });
  };
  useEffect(() => {
    if (!roomId) return;

    const fetchRoom = async () => {
      const res = await fetch(`${SERVER_URL}/room/${roomId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // 쿠키 포함
      });

      const data = await res.json();

      if (data.backgroundUrl) {
        setBackgroundUrl(data.backgroundUrl);

        // ✅ 파일명 추출
        const name = data.backgroundUrl.split("/").pop()?.split("?")[0] || "";
        setFileName(decodeURIComponent(name));
      }
    };

    fetchRoom();
  }, [roomId]);

  return {
    backgroundUrl,
    setPdfSize,
    pdfSize,
    handleFileUpload,
    clearBackground,
    fileName,
  };
};

export default useBackground;
