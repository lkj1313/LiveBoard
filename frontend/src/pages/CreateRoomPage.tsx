import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../utils/firebase";
import InputField from "../components/common/InputField";
import Button from "../components/common/Button";

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

const CreateRoomPage = () => {
  const [roomName, setRoomName] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const DEFAULT_IMAGE_URL =
    "https://firebasestorage.googleapis.com/v0/b/liveboard-24cba.firebasestorage.app/o/rooms%2Fwhiteboard.webp-1742811168081?alt=media&token=4f386f73-2bf8-421a-9df2-1fb9ebf92b80";

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

  const uploadImageToFirebase = async (file: File): Promise<string> => {
    const fileRef = ref(storage, `rooms/${file.name}-${Date.now()}`);
    await uploadBytes(fileRef, file);
    const url = await getDownloadURL(fileRef);
    return url;
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

  return (
    <div className="h-screen bg-gray-800 flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-700 mb-6">
          새로운 방 만들기
        </h2>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <form onSubmit={handleCreateRoom} className="space-y-4">
          <InputField
            id="roomName"
            label="방 이름"
            placeholder="방 이름을 입력하세요"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg"
            labelClassName="text-sm font-medium text-gray-700 mb-1 block"
          />

          <div>
            <label
              htmlFor="image"
              className="text-sm font-medium text-gray-700 mb-1 block"
            >
              이미지 선택 (선택)
            </label>
            <input
              id="image"
              type="file"
              onChange={handleFileChange}
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>

          {imagePreview && (
            <div className="mt-4">
              <img
                src={imagePreview}
                alt="미리보기"
                className="w-32 h-32 object-cover rounded-lg"
              />
            </div>
          )}

          <Button type="submit" variant="success" className="w-full">
            방 만들기
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CreateRoomPage;
