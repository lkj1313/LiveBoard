import Whiteboard from "../components/Whiteboard";
import { useLocation } from "react-router-dom";
import User from "../type/User";
import useAuthStore from "../store/authStore";
const RoomPage = () => {
  const location = useLocation();
  const user: User | null = useAuthStore((state) => state.user);
  return (
    <div style={{ padding: "20px" }}>
      <h1>
        {user?.nickname}님이 {location.state.roomName} - 방에 입장하셨습니다!
      </h1>

      <div style={{ marginTop: "20px" }}>
        <Whiteboard />
      </div>
    </div>
  );
};

export default RoomPage;
