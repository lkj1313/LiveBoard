import { useEffect, useState } from "react";

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

export const useRooms = () => {
  const [rooms, setRooms] = useState<any[]>([]);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await fetch(`${SERVER_URL}/room/rooms`, {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();
        setRooms(data.rooms || []);
      } catch (err) {
        setError("방 목록 불러오기 실패");
      }
    };

    fetchRooms();
  }, []);

  return { rooms, error };
};
