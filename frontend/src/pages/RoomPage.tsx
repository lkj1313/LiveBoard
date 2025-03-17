import Whiteboard from "../components/WhiteBoard";

const RoomPage = () => {
  return (
    <div style={{ padding: "20px" }}>
      <h1>LiveBoard - 방에 입장하셨습니다!</h1>

      <div style={{ marginTop: "20px" }}>
        <Whiteboard /> {/* 화이트보드 컴포넌트 추가 */}
      </div>
    </div>
  );
};

export default RoomPage;
