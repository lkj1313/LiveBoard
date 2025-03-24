import { useEffect, useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../utils/firebase";

const useBackground = (roomId: string | undefined) => {
  const [backgroundUrl, setBackgroundUrl] = useState<string | null>(null);
  const [pdfSize, setPdfSize] = useState({ width: 1200, height: 1000 });
  const [fileName, setFileName] = useState("선택된 파일 없음");
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !roomId) return;

    const storageRef = ref(storage, `uploads/${file.name}-${Date.now()}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    setBackgroundUrl(url);
    setFileName(file.name); // ✅ 업로드 후 파일명 저장

    await fetch(`http://localhost:4000/room/${roomId}/background`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ backgroundUrl: url }),
    });
  };

  const clearBackground = async () => {
    setBackgroundUrl(null); // 화면에서 제거
    setFileName("선택된 파일 없음"); // ✅ 파일명 초기화

    if (!roomId) return;

    await fetch(`http://localhost:4000/room/${roomId}/background`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ backgroundUrl: null }),
    });
  };
  useEffect(() => {
    if (!roomId) return;

    const fetchRoom = async () => {
      const res = await fetch(`http://localhost:4000/room/${roomId}`);
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
