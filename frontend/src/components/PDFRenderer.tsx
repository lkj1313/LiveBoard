import { useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "core-js/full/promise/with-resolvers.js";
import Button from "./common/Button";
import Stroke from "../type/Stroke";
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

interface PDFViewerProps {
  url: string;
  onSizeChange?: (size: { width: number; height: number }) => void;
  redrawCanvas: () => void;
  myStrokes: Stroke[];
  otherStrokes: Stroke[];
}
const PDFViewer = ({ url, onSizeChange, redrawCanvas }: PDFViewerProps) => {
  const [numPages, setNumPages] = useState<number>();
  const [currentPage, setCurrentPage] = useState(1);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);

  useEffect(() => {
    const fetchPDF = async () => {
      const res = await fetch(url);
      const blob = await res.blob();
      setPdfBlob(blob);
    };
    fetchPDF();
  }, [url]);

  const goPrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const goNext = () => {
    if (numPages && currentPage < numPages) setCurrentPage(currentPage + 1);
  };

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
            onRenderSuccess={({ width, height }) => {
              onSizeChange?.({ width, height });
            }}
          />
        </Document>
      )}

      {/* 페이지 네비게이션 */}
      <div className="flex flex-row gap-2 items-center z-60">
        <Button
          onClick={goPrev}
          disabled={currentPage <= 1}
          variant="secondary"
          className="px-4 py-2 "
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
          className="px-4 py-2 "
        >
          다음
        </Button>
      </div>
    </div>
  );
};

export default PDFViewer;
