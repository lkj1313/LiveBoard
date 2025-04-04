import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import Button from "../components/common/Button";
import { useRooms } from "../hooks/rooms/useRoom";
import useLogout from "../hooks/auth/useLogout";

const HomePage = () => {
  const { rooms, error } = useRooms();
  const handleLogout = useLogout();

  return (
    <div className="h-screen bg-gray-800 flex justify-center items-center">
      <div className="bg-gray-200 p-8 max-h-[480px] rounded-lg shadow-lg w-full max-w-md overflow-y-auto ">
        <h2 className="text-3xl font-bold text-center text-gray-700 mb-6">
          LiveBoard
        </h2>
        {/* 방 목록 */}
        <div className="space-y-4">
          <h3 className="text-xl text-gray-600 mb-2">방 목록</h3>
          {Array.isArray(rooms) && rooms.length === 0 ? (
            <p className="text-center text-gray-500">현재 방이 없습니다.</p>
          ) : (
            rooms.map((room) => (
              <Link
                key={room._id}
                to={`/room/${room._id}`}
                state={{ roomName: room.name }}
                className="flex p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition items-center gap-2"
              >
                <img
                  src={room.image}
                  className="w-10 h-10 border rounded-full"
                ></img>
                {room.name}
              </Link>
            ))
          )}
        </div>
        {/* 방 생성 버튼 */}
        <div className="mt-6 flex flex-col gap-2">
          <Link
            to="/create-room"
            className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-center cursor-pointer"
          >
            새로운 방 만들기
          </Link>

          {/* 로그아웃 버튼 */}
          <Button onClick={handleLogout} variant="danger" className="w-full">
            로그아웃
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
