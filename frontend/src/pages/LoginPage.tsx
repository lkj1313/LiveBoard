import { useState } from "react";
import InputField from "../components/common/InputField";
import Button from "../components/common/Button";
import useLogin from "../hooks/auth/useLogin";
import { Link } from "react-router-dom";

const LoginPage = () => {
  const [email, setEmail] = useState("test@naver.com");
  const [password, setPassword] = useState("123456");
  const { login, error } = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, password);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold text-center mb-4 text-gray-700">
          LiveBoard 로그인
        </h2>

        {error && <p className="text-red-500 text-center">{error}</p>}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <InputField
            id="email"
            label="이메일"
            type="email"
            placeholder="이메일 입력"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg"
            labelClassName="text-sm font-medium text-gray-700 mb-1 block"
          />
          <InputField
            id="password"
            label="비밀번호"
            type="password"
            placeholder="비밀번호 입력"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg"
            labelClassName="text-sm font-medium text-gray-700 mb-1 block"
          />
          <Button type="submit" variant="primary" className="w-full">
            로그인
          </Button>
        </form>

        <p className="text-center text-gray-600 mt-4">
          계정이 없으신가요?{" "}
          <Link to="/register" className="text-blue-500 hover:underline">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
