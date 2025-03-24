import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
const SERVER_URL = import.meta.env.VITE_SERVER_URL;
const RegisterPage = () => {
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("비밀번호는 최소 6자 이상 입력해야 합니다.");
      return;
    }

    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      const res = await fetch(`${SERVER_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname, email, password }),
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      alert("회원가입 성공! 로그인 페이지로 이동합니다.");
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "회원가입 실패");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold text-center mb-4 text-gray-700">
          LiveBoard 회원가입
        </h2>

        {error && <p className="text-red-500 text-center">{error}</p>}

        <form className="space-y-4" onSubmit={handleRegister}>
          <div>
            <label htmlFor="nickname" className="block text-gray-700">
              닉네임
            </label>
            <input
              id="nickname"
              type="text"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring focus:ring-blue-200"
              placeholder="닉네임 입력"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-gray-700">
              이메일
            </label>
            <input
              id="email"
              type="email"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring focus:ring-blue-200"
              placeholder="이메일 입력"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-gray-700">
              비밀번호 (6자 이상)
            </label>
            <input
              id="password"
              type="password"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring focus:ring-blue-200"
              placeholder="비밀번호 입력"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-gray-700">
              비밀번호 확인
            </label>
            <input
              id="confirmPassword"
              type="password"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring focus:ring-blue-200"
              placeholder="비밀번호 확인"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition"
          >
            회원가입
          </button>
        </form>

        <p className="text-center text-gray-600 mt-4">
          이미 계정이 있으신가요?{" "}
          <Link to="/login" className="text-blue-500 hover:underline">
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
