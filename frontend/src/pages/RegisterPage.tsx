import { Link } from "react-router-dom";
import InputField from "../components/common/InputField";
import Button from "../components/common/Button";
import { useRegisterForm } from "../hooks/auth/useRegister";

const RegisterPage = () => {
  const {
    nickname,
    setNickname,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    error,
    handleRegister,
  } = useRegisterForm();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold text-center mb-4 text-gray-700">
          LiveBoard 회원가입
        </h2>

        {error && <p className="text-red-500 text-center">{error}</p>}

        <form className="space-y-4" onSubmit={handleRegister}>
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
            id="nickname"
            label="닉네임"
            placeholder="닉네임 입력"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg"
            labelClassName="text-sm font-medium text-gray-700 mb-1 block"
          />
          <InputField
            id="password"
            label="비밀번호 (6자 이상)"
            type="password"
            placeholder="비밀번호 입력"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg"
            labelClassName="text-sm font-medium text-gray-700 mb-1 block"
          />
          <InputField
            id="confirmPassword"
            label="비밀번호 확인"
            type="password"
            placeholder="비밀번호 확인"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg"
            labelClassName="text-sm font-medium text-gray-700 mb-1 block"
          />
          <Button type="submit" variant="success" className="w-full">
            회원가입
          </Button>
        </form>

        <p className="text-center text-gray-600 mt-4">
          이미 계정이 있으신가요?{" "}
          <Link to="/" className="text-blue-500 hover:underline">
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
