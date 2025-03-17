import jwt from "jsonwebtoken";

const verifyToken = (req, res, next) => {
  const token = req.cookies.token; // 쿠키에서 JWT 토큰 읽기

  if (!token) {
    return res.status(401).json({ message: "인증 토큰이 없습니다." });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log("Token verification failed:", err); // 디버깅을 위한 로그

      return res.status(403).json({ message: "유효하지 않은 토큰입니다." });
    }

    req.user = user; // 인증된 사용자 정보 (주로 _id 포함)
    next(); // 미들웨어를 계속 진행
  });
};

export default verifyToken;
