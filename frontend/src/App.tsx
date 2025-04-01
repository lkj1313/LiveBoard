import Router from "./routes/Router";
import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import useAuthStore from "./store/authStore";
const SERVER_URL = import.meta.env.VITE_SERVER_URL;
function App() {
  const { setUser, logout } = useAuthStore();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${SERVER_URL}/auth/me`, {
          method: "GET",
          credentials: "include", //  쿠키 포함
        });

        if (!res.ok) throw new Error("인증 실패");

        const data = await res.json();
        setUser(data); //  Zustand에 유저 정보 저장
      } catch (err) {
        logout(); //  인증 실패 시 유저 상태 초기화
      }
    };

    checkAuth();
  }, [setUser, logout]);
  return (
    <>
      <Toaster position="top-left" reverseOrder={false} />
      <Router />
    </>
  );
}

export default App;
