import { useEffect, useState } from "react";
import { socket, connectSocket } from "../utils/socket";
import useAuthStore from "../store/authStore";
import toast from "react-hot-toast";
import Stroke from "../type/Stroke";
import { ImageObjType } from "../type/Image";

interface UseSocketHandlersProps {
  roomId: string;
  setMyStrokes: React.Dispatch<React.SetStateAction<Stroke[]>>;
  setOtherStrokes: React.Dispatch<React.SetStateAction<Stroke[]>>;
  setImageObjs: React.Dispatch<React.SetStateAction<ImageObjType[]>>;
}

const useSocketHandlers = ({
  roomId,
  setMyStrokes,
  setOtherStrokes,
  setImageObjs,
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
    socket.on(
      "loadCanvasImages",
      (canvasImages: { id: string; url: string; x: number; y: number }[]) => {
        canvasImages.forEach(({ id, url, x, y }) => {
          const img = new Image();
          img.src = url;
          img.onload = () => {
            setImageObjs((prev) => [
              ...prev,
              { id, img, x, y, isDragging: false },
            ]);
          };
        });
      }
    );

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
    socket.on("newImage", ({ id, url, x, y }) => {
      const img = new Image();
      img.src = url;

      img.onload = () => {
        setOtherStrokes((prev) => {
          return prev;
        });

        setImageObjs?.((prev) => [
          ...prev,
          {
            id,
            x,
            y,
            isDragging: false,
            img,
          },
        ]);
      };
    });
    socket.on("moveImage", ({ imageId, x, y }) => {
      setImageObjs((prev) =>
        prev.map((img) => (img.id === imageId ? { ...img, x, y } : img))
      );
    });
    socket.on("deleteImage", ({ imageId }) => {
      setImageObjs((prev) => prev.filter((img) => img.id !== imageId));
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
      socket.off("newImage");
      socket.off("deleteImage");
      socket.disconnect();
    };
  }, [roomId, setMyStrokes, setOtherStrokes, user]);

  return { userList };
};

export default useSocketHandlers;
