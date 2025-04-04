import { useEffect, useRef, useState } from "react";
import { socket } from "../../utils/socket";
import { useParams } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import { ChatMessage } from "../../type/ChatMessage";

export const useChatBox = () => {
  const { id: roomId } = useParams();
  const user = useAuthStore((state) => state.user);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

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
    setTimeout(scrollToBottom, 50);
  };

  useEffect(() => {
    socket.on("chatMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });
    return () => {
      socket.off("chatMessage");
    };
  }, []);

  return {
    isOpen,
    setIsOpen,
    messages,
    input,
    setInput,
    handleSend,
    chatContainerRef,
  };
};
