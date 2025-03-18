import Whiteboard from "../components/Whiteboard";

const RoomPage = () => {
  return (
    <div style={{ padding: "20px" }}>
      <h1>LiveBoard - 방에 입장하셨습니다!</h1>

      <div style={{ marginTop: "20px" }}>
        <Whiteboard />
      </div>
    </div>
  );
};

export default RoomPage;
