import { useEffect, useState } from "react";
import { pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

export const usePdfViewer = (
  url: string,
  onSizeChange?: (size: { width: number; height: number }) => void
) => {
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
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const goNext = () => {
    if (numPages && currentPage < numPages) setCurrentPage((prev) => prev + 1);
  };

  const handleSizeChange = ({
    width,
    height,
  }: {
    width: number;
    height: number;
  }) => {
    onSizeChange?.({ width, height });
  };

  return {
    pdfBlob,
    numPages,
    currentPage,
    setNumPages,
    goPrev,
    goNext,
    handleSizeChange,
  };
};
