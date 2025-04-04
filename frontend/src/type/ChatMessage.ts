export type ChatMessage = {
  user: {
    userId: string;
    nickname: string;
  };
  message: string;
  timestamp: string;
};
