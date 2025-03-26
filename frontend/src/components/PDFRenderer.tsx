import { useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "core-js/full/promise/with-resolvers.js";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

interface PDFViewerProps {
  url: string;
  onSizeChange: (size: { width: number; height: number }) => void;
}

const PDFViewer = ({ url, onSizeChange }: PDFViewerProps) => {
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
            width={1000}
            onRenderSuccess={({ width, height }) => {
              onSizeChange?.({ width, height });
            }}
          />
        </Document>
      )}

      {/* 페이지 네비게이션 */}
      <div className="flex gap-4">
        <button
          onClick={goPrev}
          disabled={currentPage <= 1}
          className="bg-gray-300 px-4 py-2 rounded disabled:opacity-50"
        >
          이전
        </button>
        <span>
          {currentPage} / {numPages || "?"}
        </span>
        <button
          onClick={goNext}
          disabled={currentPage >= (numPages || 0)}
          className="bg-gray-300 px-4 py-2 rounded disabled:opacity-50"
        >
          다음
        </button>
      </div>
    </div>
  );
};

export default PDFViewer;
