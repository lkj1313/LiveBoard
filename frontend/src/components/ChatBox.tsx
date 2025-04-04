import InputField from "./common/InputField";
import Button from "./common/Button";
import { useChatBox } from "../hooks/chat/useChatBox";

const ChatBox = () => {
  const {
    isOpen,
    setIsOpen,
    messages,
    input,
    setInput,
    handleSend,
    chatContainerRef,
  } = useChatBox();

  return (
    <div className="fixed bottom-0 left-0 z-50 w-60">
      {/* 토글 버튼 */}
      <div
        className="bg-blue-600 text-white text-sm text-center py-1 rounded-t-lg cursor-pointer shadow-lg hover:bg-blue-700"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        {isOpen ? "채팅 ▾" : "채팅 ▴"}
      </div>

      {/* 채팅창 */}
      <div
        className={`bg-white rounded-t-lg shadow-lg transition-all duration-300 overflow-hidden ${
          isOpen ? "opacity-100" : "opacity-0 max-h-0"
        } flex flex-col`}
      >
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

        <form onSubmit={handleSend} className="flex border-t text-sm">
          <InputField
            label=""
            id="chat-input"
            placeholder="메시지를 입력하세요..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            required={false}
            className="flex-1 p-2"
          />
          <Button
            type="submit"
            variant="primary"
            className="px-3 flex-1 w-full"
          >
            전송
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatBox;
