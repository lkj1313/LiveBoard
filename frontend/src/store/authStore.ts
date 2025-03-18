import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
// ✅ 상태 타입 정의
interface AuthState {
  user: { nickname: string; userId: string } | null;
  setUser: (user: { nickname: string; userId: string }) => void;
  logout: () => void;
}
// ✅ 로그인 상태 관리하는 Zustand 스토어
const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null, // ✅ 로그인한 유저 정보 (nickname, userId)
      setUser: (user: any) => set({ user }), // ✅ 로그인 성공 시 유저 정보 저장
      logout: () => set({ user: null }), // ✅ 로그아웃 시 상태 초기화
    }),
    {
      name: "auth-storage", // ✅ localStorage에 저장할 키 값
      storage: createJSONStorage(() => localStorage), // ✅ localStorage 사용 (sessionStorage로 변경 가능)
    }
  )
);

export default useAuthStore;
