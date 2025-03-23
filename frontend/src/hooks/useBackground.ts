import { useEffect, useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../utils/firebase";

const useBackground = (roomId: string | undefined) => {
  const [backgroundUrl, setBackgroundUrl] = useState<string | null>(null);
  const [pdfSize, setPdfSize] = useState({ width: 800, height: 600 });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !roomId) return;

    const storageRef = ref(storage, `uploads/${file.name}-${Date.now()}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    setBackgroundUrl(url);

    await fetch(`http://localhost:4000/room/${roomId}/background`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ backgroundUrl: url }),
    });
  };

  useEffect(() => {
    if (!roomId) return;

    const fetchRoom = async () => {
      const res = await fetch(`http://localhost:4000/room/${roomId}`);
      const data = await res.json();
      if (data.backgroundUrl) {
        setBackgroundUrl(data.backgroundUrl);
      }
    };

    fetchRoom();
  }, [roomId]);

  return {
    backgroundUrl,
    setPdfSize,
    pdfSize,
    handleFileUpload,
  };
};

export default useBackground;
