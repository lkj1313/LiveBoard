export default interface Stroke {
  userId: string;
  nickname: string;
  points: { x: number; y: number }[];
}
