// hooks/useLogin.ts
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

const useLogin = () => {
  const [error, setError] = useState<string | null>(null);
  const setUser = useAuthStore((state) => state.setUser);
  const navigate = useNavigate();

  const login = async (email: string, password: string) => {
    setError(null);

    try {
      const res = await fetch(`${SERVER_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setUser({ nickname: data.nickname, userId: data.userId });
      navigate("/home");
    } catch (err) {
      setError(err instanceof Error ? err.message : "로그인 실패");
    }
  };

  return { login, error };
};

export default useLogin;
