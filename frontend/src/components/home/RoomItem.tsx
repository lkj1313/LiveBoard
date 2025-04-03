import { Link } from "react-router-dom";

type Room = {
  _id: string;
  name: string;
  image: string;
};

const RoomItem = ({ room }: { room: Room }) => {
  return (
    <Link
      to={`/room/${room._id}`}
      state={{ roomName: room.name }}
      className="flex items-center gap-3 p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
    >
      <img
        src={room.image}
        alt="room"
        className="w-10 h-10 rounded-full border object-cover"
      />
      <span className="font-medium">{room.name}</span>
    </Link>
  );
};

export default RoomItem;
