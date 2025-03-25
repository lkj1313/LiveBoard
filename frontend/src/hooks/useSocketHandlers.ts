import { useEffect, useState } from "react";
import { socket, connectSocket } from "../utils/socket";
import useAuthStore from "../store/authStore";
import toast from "react-hot-toast";

interface Stroke {
  userId: string;
  nickname: string;
  points: { x: number; y: number }[];
}

interface UseSocketHandlersProps {
  roomId: string;
  setStrokes: React.Dispatch<React.SetStateAction<Stroke[]>>;
}

const useSocketHandlers = ({ roomId, setStrokes }: UseSocketHandlersProps) => {
  const [userList, setUserList] = useState<string[]>();
  console.log(userList);
  const user = useAuthStore((state) => state.user);
  useEffect(() => {
    if (!user) return;
    connectSocket();

    socket.on("connect", () => {
      console.log("✅ 소켓 연결됨:", socket.id);
      socket.emit("join", { roomId, nickname: user.nickname });
    });
    socket.on("userList", (nicknames) => {
      setUserList(nicknames); // or setState로 저장
    });
    socket.on("loadDrawings", (strokes: Stroke[]) => {
      console.log("🖼️ 서버로부터 그림 받아옴:", strokes);
      setStrokes(strokes);
    });

    socket.on("draw", (stroke: Stroke) => {
      setStrokes((prev) => [...prev, stroke]);
    });

    socket.on("erase", ({ userId, x, y }) => {
      setStrokes((prev) =>
        prev.filter((stroke) => {
          if (stroke.userId !== userId) return true;
          const isNearClick = stroke.points.some(
            (point) => Math.abs(point.x - x) < 5 && Math.abs(point.y - y) < 5
          );
          return !isNearClick;
        })
      );
    });

    socket.on("clear", ({ userId }) => {
      setStrokes((prev) => prev.filter((stroke) => stroke.userId !== userId));
    });
    socket.on("userJoin", (nickname: string) => {
      toast.success(`${nickname}님이 입장하셨습니다!`);
    });

    socket.on("userLeave", (nickname: string) => {
      toast(`${nickname}님이 퇴장하셨습니다.`, { icon: "👋" });
    });

    return () => {
      socket.off("connect");
      socket.off("join");
      socket.off("draw");
      socket.off("erase");
      socket.off("clear");
      socket.off("loadDrawings");
      socket.off("userJoin");
      socket.off("userLeave");
      socket.disconnect();
    };
  }, [roomId, setStrokes]);
  return { userList };
};

export default useSocketHandlers;
