import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const HomePage = () => {
  const [rooms, setRooms] = useState<any[]>([]);

  useEffect(() => {
    fetch("http://localhost:4000/room/rooms")
      .then((res) => res.json())
      .then((data) => setRooms(data.rooms));
  }, []);
  console.log(rooms);
  return (
    <div className="h-screen bg-gray-800 flex justify-center items-center">
      <div className="bg-gray-200 p-8 max-h-[480px] rounded-lg shadow-lg w-full max-w-md overflow-y-auto ">
        <h2 className="text-3xl font-bold text-center text-gray-700 mb-6">
          LiveBoard
        </h2>

        {/* 방 목록 */}
        <div className="space-y-4">
          <h3 className="text-xl text-gray-600 mb-2">방 목록</h3>
          {rooms.length === 0 ? (
            <p className="text-center text-gray-500">현재 방이 없습니다.</p>
          ) : (
            rooms.map((room) => (
              <Link
                key={room._id}
                to={`/room/${room._id}`}
                state={{ roomName: room.name }}
                className="block p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              >
                {room.name}
              </Link>
            ))
          )}
        </div>

        {/* 방 생성 버튼 */}
        <div className="mt-6 ">
          <Link
            to="/create-room"
            className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
          >
            새로운 방 만들기
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
