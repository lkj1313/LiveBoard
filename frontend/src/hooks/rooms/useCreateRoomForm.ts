import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DEFAULT_IMAGE_URL } from "../../constants/defaults";
import { uploadImageToFirebase } from "../../utils/uploadImage";
const SERVER_URL = import.meta.env.VITE_SERVER_URL;
export const useCreateRoomForm = () => {
  const [roomName, setRoomName] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const navigate = useNavigate();
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const file = e.target.files[0];
      setImage(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (roomName.trim() === "") {
      setError("방 이름을 입력해주세요.");
      return;
    }

    try {
      let imageUrl = DEFAULT_IMAGE_URL;
      if (image) {
        imageUrl = await uploadImageToFirebase(image);
      }

      const response = await fetch(`${SERVER_URL}/room/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: roomName, image: imageUrl }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      alert("방이 생성되었습니다!");
      navigate("/home");
    } catch (err) {
      setError(err instanceof Error ? err.message : "방 생성 실패");
    }
  };
  return {
    roomName,
    setRoomName,
    imagePreview,
    handleFileChange,
    handleCreateRoom,
    error,
  };
};
