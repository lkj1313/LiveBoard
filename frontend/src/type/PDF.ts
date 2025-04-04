import Stroke from "./Stroke";
export interface PDFViewerProps {
  url: string;
  onSizeChange?: (size: { width: number; height: number }) => void;

  myStrokes: Stroke[];
  otherStrokes: Stroke[];
}
