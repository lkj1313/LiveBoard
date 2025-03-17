import { BrowserRouter, Route, Routes } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import HomePage from "../pages/HomePage";
import CreateRoomPage from "../pages/CreateRoomPage";
import RoomPage from "../pages/RoomPage";

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="home" element={<HomePage />} />
        <Route path="create-room" element={<CreateRoomPage />} />
        <Route path="room/:id" element={<RoomPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
