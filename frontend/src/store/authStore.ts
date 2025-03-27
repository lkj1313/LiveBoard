import { create } from "zustand";
const SERVER_URL = import.meta.env.VITE_SERVER_URL;

interface AuthState {
  user: { nickname: string; userId: string } | null;
  setUser: (user: { nickname: string; userId: string }) => void;
  logout: () => void;
}
// 로그인 상태 관리하는 Zustand 스토어
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: async () => {
    await fetch(`${SERVER_URL}/auth/logout`, {
      method: "POST",
      credentials: "include", // 쿠키 포함
    });
    set({ user: null }); // Zustand 상태 초기화
  },
}));
export default useAuthStore;
