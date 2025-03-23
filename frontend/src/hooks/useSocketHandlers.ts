import { useEffect } from "react";
import { socket, connectSocket } from "../utils/socket";

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
  useEffect(() => {
    connectSocket();

    socket.on("connect", () => {
      console.log("✅ 소켓 연결됨:", socket.id);
      socket.emit("join", roomId);
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

    return () => {
      socket.off("connect");
      socket.off("join");
      socket.off("draw");
      socket.off("erase");
      socket.off("clear");
      socket.off("loadDrawings");
      socket.disconnect();
    };
  }, [roomId, setStrokes]);
};

export default useSocketHandlers;
