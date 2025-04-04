import Whiteboard from "../components/Whiteboard";
import { useLocation } from "react-router-dom";

import ChatBox from "../components/chat/ChatBox";

const RoomPage = () => {
  const location = useLocation();
  const { roomName } = location.state as { roomName: string };

  return (
    <div className=" w-screen flex flex-col justify-center">
      <Whiteboard roomName={roomName} />
      <ChatBox />
    </div>
  );
};

export default RoomPage;
