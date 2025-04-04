import InputField from "../components/common/InputField";
import Button from "../components/common/Button";
import { useCreateRoomForm } from "../hooks/rooms/useCreateRoomForm";
import ImagePreview from "../components/common/ImagePreview";

const CreateRoomPage = () => {
  const {
    roomName,
    setRoomName,
    imagePreview,
    handleFileChange,
    handleCreateRoom,
    error,
  } = useCreateRoomForm();

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

          <InputField
            id="image"
            label="이미지 선택 (선택)"
            type="file"
            onChange={handleFileChange}
            className="w-full p-2 border border-gray-300 rounded-lg cursor-pointer"
            labelClassName="text-sm font-medium text-gray-700 mb-1 block"
            required={false}
            accept="image/*"
          />

          {imagePreview && <ImagePreview src={imagePreview} />}

          <Button type="submit" variant="success" className="w-full">
            방 만들기
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CreateRoomPage;
