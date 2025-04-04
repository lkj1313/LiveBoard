import { Document, Page, pdfjs } from "react-pdf";
import "core-js/full/promise/with-resolvers.js";
import Button from "../common/Button";
import { usePdfViewer } from "../../hooks/whiteBoard/usePdfViewer";
import Stroke from "../../type/Stroke";
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
  import.meta.url
).toString();
interface PDFViewerProps {
  url: string;
  onSizeChange?: (size: { width: number; height: number }) => void;

  myStrokes: Stroke[];
  otherStrokes: Stroke[];
}
const PDFViewer = ({ url, onSizeChange }: PDFViewerProps) => {
  const {
    pdfBlob, // 가져온 PDF 데이터를 Blob 형태로 저장한 상태
    numPages, // PDF의 총 페이지 수
    currentPage, // 현재 보고 있는 페이지 번호
    goPrev, // 이전 페이지로 이동하는 함수
    goNext, // 다음 페이지로 이동하는 함수
    setNumPages, // PDF 로드 성공 시 페이지 수 설정하는 함수
    handleSizeChange, // PDF 페이지 렌더링 후 사이즈 변경 콜백 처리 함수
  } = usePdfViewer(url, onSizeChange);
  return (
    <div className="flex flex-col items-center gap-4">
      {pdfBlob && (
        <Document
          file={pdfBlob}
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          onLoadError={(err) => console.error("PDF Load Error", err)}
        >
          <Page
            pageNumber={currentPage}
            height={1000}
            onRenderSuccess={handleSizeChange}
          />
        </Document>
      )}

      {/* 페이지 네비게이션 */}
      <div className="flex flex-row gap-2 items-center z-60">
        <Button
          onClick={goPrev}
          disabled={currentPage <= 1}
          variant="secondary"
          className="px-4 py-2"
        >
          이전
        </Button>
        <span>
          {currentPage} / {numPages || "?"}
        </span>
        <Button
          onClick={goNext}
          disabled={currentPage >= (numPages || 0)}
          variant="secondary"
          className="px-4 py-2"
        >
          다음
        </Button>
      </div>
    </div>
  );
};

export default PDFViewer;
