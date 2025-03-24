import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../utils/firebase"; // 이미 설정한 firebase storage 인스턴스
const SERVER_URL = import.meta.env.VITE_SERVER_URL;
const CreateRoomPage = () => {
  const [roomName, setRoomName] = useState("");
  const [image, setImage] = useState<File | null>(null); // 이미지 파일 상태 관리
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null); // 이미지 미리보기 상태
  const navigate = useNavigate();

  // 파일 선택 시 미리보기 처리
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const file = e.target.files[0];
      setImage(file); // 파일을 상태에 저장

      // 이미지 미리보기 생성
      const reader = new FileReader();

      // 파일 읽기가 완료되면 실행될 콜백 함수
      reader.onloadend = () => {
        setImagePreview(reader.result as string); // 미리보기 URL을 상태에 저장
      };

      // 파일을 데이터 URL로 읽기 시작
      reader.readAsDataURL(file); // 파일을 비동기적으로 읽기 시작
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
      let imageUrl: string | null = null;

      // ✅ Firebase Storage에 업로드
      if (image) {
        imageUrl = await uploadImageToFirebase(image);
      }

      const response = await fetch(`${SERVER_URL}/room/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: roomName,
          image: imageUrl, // 그냥 URL만 보냄
        }),
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
          <div>
            <label htmlFor="roomName" className="block text-gray-700">
              방 이름
            </label>
            <input
              id="roomName"
              type="text"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring focus:ring-blue-200"
              placeholder="방 이름을 입력하세요"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              required
            />
          </div>

          {/* 이미지 파일 업로드 */}
          <div>
            <label htmlFor="image" className="block text-gray-700">
              이미지 선택 (선택)
            </label>
            <input
              id="image"
              type="file"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring focus:ring-blue-200"
              onChange={handleFileChange}
            />
          </div>

          {/* 이미지 미리보기 */}
          {imagePreview && (
            <div className="mt-4">
              <img
                src={imagePreview}
                alt="미리보기"
                className="w-32 h-32 object-cover rounded-lg "
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition"
          >
            방 만들기
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateRoomPage;
