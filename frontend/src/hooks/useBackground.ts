import { useEffect, useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../utils/firebase";

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

const useBackground = (roomId: string | undefined) => {
  const [backgroundUrl, setBackgroundUrl] = useState<string | null>(null);
  const [pdfSize, setPdfSize] = useState({ width: 1000, height: 1000 });
  const [fileName, setFileName] = useState("선택된 파일 없음");
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      const storageRef = ref(storage, `uploads/${file.name}-${Date.now()}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      setBackgroundUrl(url);
      setFileName(file.name);

      if (!roomId) return;

      const res = await fetch(`${SERVER_URL}/room/${roomId}/background`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ backgroundUrl: url }),
      });

      if (!res.ok) {
        const errMsg = await res.text();
        throw new Error(`서버 응답 오류: ${errMsg}`);
      }
    } catch (err) {
      console.error("❌ PDF 업로드 에러:", err);
      alert("PDF 업로드 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
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
    handlePdfUpload,
    clearBackground,
    fileName,
  };
};

export default useBackground;
