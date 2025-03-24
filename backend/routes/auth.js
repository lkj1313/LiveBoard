import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

//  회원가입 API
router.post("/register", async (req, res) => {
  try {
    const { email, nickname, password } = req.body;

    // 이메일 중복 확인
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ error: "이미 사용 중인 이메일입니다." });

    // 닉네임 중복 확인
    const existingNickname = await User.findOne({ nickname });
    if (existingNickname)
      return res.status(400).json({ error: "이미 사용 중인 닉네임입니다." });

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);

    // 새로운 사용자 저장
    const newUser = new User({ email, nickname, password: hashedPassword });
    await newUser.save();

    // JWT 토큰 생성
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "3h",
    });

    // 쿠키에 저장
    res.cookie("token", token, { httpOnly: true });

    res.status(201).json({
      message: "회원가입 성공!",
      userId: newUser._id,
      nickname: newUser.nickname,
    });
  } catch (error) {
    res.status(500).json({ error: "서버 오류" });
  }
});

// 로그인 API
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ error: "존재하지 않는 이메일입니다." });

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword)
      return res.status(400).json({ error: "비밀번호가 틀렸습니다." });

    // JWT 토큰 생성
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "3h",
    });

    // 쿠키에 저장
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None", // 모든 크로스 요청에 허용
    });
    res.json({
      nickname: user.nickname,
      userId: user._id,
    });
  } catch (error) {
    res.status(500).json({ error: "서버 오류" });
  }
});

// 로그인한 사용자 정보 가져오기
router.get("/me", async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "로그인이 필요합니다." });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");
    res.json({ email: user.email, nickname: user.nickname });
  } catch {
    res.status(401).json({ error: "유효하지 않은 토큰" });
  }
});
export default router;
