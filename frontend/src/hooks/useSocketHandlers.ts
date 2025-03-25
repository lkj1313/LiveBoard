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
  setMyStrokes: React.Dispatch<React.SetStateAction<Stroke[]>>;
  setOtherStrokes: React.Dispatch<React.SetStateAction<Stroke[]>>;
}

const useSocketHandlers = ({
  roomId,
  setMyStrokes,
  setOtherStrokes,
}: UseSocketHandlersProps) => {
  const [userList, setUserList] = useState<string[]>();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!user) return;
    connectSocket();

    socket.on("connect", () => {
      console.log("✅ 소켓 연결됨:", socket.id);
      socket.emit("join", { roomId, nickname: user.nickname });
    });

    socket.on("userList", (nicknames) => {
      setUserList(nicknames);
    });

    socket.on("loadDrawings", (strokes: Stroke[]) => {
      const my = strokes.filter((s) => s.userId === user.userId);
      const others = strokes.filter((s) => s.userId !== user.userId);
      setMyStrokes(my);
      setOtherStrokes(others);
    });

    socket.on("draw", (stroke: Stroke) => {
      if (stroke.userId !== user.userId) {
        setOtherStrokes((prev) => [...prev, stroke]);
      }
    });

    socket.on("erase", ({ userId, x, y }) => {
      if (userId !== user.userId) {
        setOtherStrokes((prev) =>
          prev.filter((stroke) => {
            if (stroke.userId !== userId) return true;
            const isNearClick = stroke.points.some(
              (point) => Math.abs(point.x - x) < 5 && Math.abs(point.y - y) < 5
            );
            return !isNearClick;
          })
        );
      }
    });

    socket.on("clear", ({ userId }) => {
      if (userId !== user.userId) {
        setOtherStrokes((prev) =>
          prev.filter((stroke) => stroke.userId !== userId)
        );
      }
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
  }, [roomId, setMyStrokes, setOtherStrokes, user]);

  return { userList };
};

export default useSocketHandlers;
