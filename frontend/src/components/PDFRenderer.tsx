import { useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "core-js/full/promise/with-resolvers.js";

// pdf.worker 직접 지정 (Vite에서 확실하게 작동함)
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
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [pageSizes, setPageSizes] = useState<
    Record<number, { width: number; height: number }>
  >({});

  useEffect(() => {
    const fetchPDF = async () => {
      const res = await fetch(url);
      const blob = await res.blob();
      setPdfBlob(blob);
    };
    fetchPDF();
  }, [url]);

  // 전체 크기 계산 후 상위로 전달
  useEffect(() => {
    if (!numPages) return;
    if (Object.keys(pageSizes).length === numPages) {
      const maxWidth = Math.max(
        ...Object.values(pageSizes).map((p) => p.width)
      );
      const totalHeight = Object.values(pageSizes).reduce(
        (acc, p) => acc + p.height,
        0
      );
      onSizeChange?.({ width: maxWidth, height: totalHeight });
    }
  }, [pageSizes, numPages, onSizeChange]);

  return (
    <div className="w-full h-full flex flex-col items-center">
      {pdfBlob && (
        <Document
          file={pdfBlob}
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          onLoadError={(err) => console.error("PDF Load Error", err)}
        >
          {Array.from({ length: numPages || 0 }, (_, i) => (
            <Page
              key={`page_${i + 1}`}
              pageNumber={i + 1}
              width={800}
              className="mb-4"
              onRenderSuccess={({ width, height }) => {
                setPageSizes((prev) => ({
                  ...prev,
                  [i + 1]: { width, height },
                }));
              }}
            />
          ))}
        </Document>
      )}
    </div>
  );
};

export default PDFViewer;
