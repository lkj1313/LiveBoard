import Whiteboard from "../components/Whiteboard";
import { useLocation } from "react-router-dom";
import User from "../type/User";
import useAuthStore from "../store/authStore";
import ChatBox from "../components/ChatBox";
const RoomPage = () => {
  const location = useLocation();
  const user: User | null = useAuthStore((state) => state.user);
  return (
    <div className=" w-screen flex flex-col justify-center">
      <h1 className="text-center">
        {user?.nickname}님이 {location.state.roomName} - 방에 입장하셨습니다!
      </h1>

      <Whiteboard />
      <ChatBox />
    </div>
  );
};

export default RoomPage;
