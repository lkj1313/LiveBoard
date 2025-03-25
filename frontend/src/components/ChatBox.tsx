import { useEffect, useRef, useState } from "react";
import { socket } from "../utils/socket"; // 이미 쓰고 있던 소켓 인스턴스
import { useParams } from "react-router-dom";
import useAuthStore from "../store/authStore";
type ChatMessage = {
  user: {
    userId: string;
    nickname: string;
  };
  message: string;
  timestamp: string;
};
const ChatBox = () => {
  const { id: roomId } = useParams();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const user = useAuthStore((state) => state.user);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  console.log(roomId);

  // 소켓 리스너 설정
  useEffect(() => {
    socket.on("chatMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });
    return () => {
      socket.off("chatMessage");
    };
  }, []);
  // ✅ 내가 보낼 때만 스크롤 내리기
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  };
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user) return;

    socket.emit("chatMessage", {
      roomId,
      user,
      message: input,
    });

    setInput("");

    // 렌더 후 스크롤 - 약간 딜레이
    setTimeout(scrollToBottom, 50);
  };

  return (
    <div className="fixed bottom-0 left-0 z-50 w-60">
      {/* 🔘 막대기 버튼 */}
      <div
        className="bg-blue-600 text-white text-sm text-center py-1 rounded-t-lg cursor-pointer shadow-lg hover:bg-blue-700"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        {isOpen ? "채팅 ▾" : "채팅 ▴"}
      </div>

      {/* 💬 채팅창 */}
      <div
        className={`bg-white rounded-t-lg shadow-lg transition-all duration-300 overflow-hidden ${
          isOpen ? "opacity-100" : "opacity-0 max-h-0"
        } flex flex-col`}
      >
        {/* 채팅 내용 */}
        <div
          ref={chatContainerRef}
          className="p-2 text-sm overflow-y-auto"
          style={{ height: "200px" }}
        >
          {messages.map((msg, idx) => (
            <div key={idx}>
              <strong className="text-blue-600">{msg.user.nickname}</strong>:{" "}
              {msg.message}
            </div>
          ))}
        </div>

        {/* 입력창 */}
        <form onSubmit={handleSend} className="flex border-t text-sm">
          <input
            className="flex-1 p-2"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="메시지를 입력하세요..."
          />
          <button className="bg-blue-500 text-white px-3" type="submit">
            전송
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatBox;
