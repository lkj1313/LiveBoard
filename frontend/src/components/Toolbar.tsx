// components/Toolbar.tsx
import React from "react";
import FileUploader from "./FileUploader";

interface ToolbarProps {
  fileName: string;
  isErasing: boolean;
  onToggleDraw: () => void;
  onToggleErase: () => void;
  onClear: () => void;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearBackground: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  isErasing,
  onToggleDraw,
  onToggleErase,
  onClear,
  onUpload,
  onClearBackground,
  fileName,
}) => {
  return (
    <div className="flex gap-2 mb-4 py-2 bg-white bg-opacity-80 rounded shadow z-10">
      <button
        onClick={onToggleDraw}
        className={`px-3 py-2 rounded border ${
          !isErasing
            ? "bg-blue-500 text-white"
            : "bg-gray-200 text-black border-gray-300"
        }`}
      >
        ✏️ 그리기
      </button>
      <button
        onClick={onToggleErase}
        className={`px-3 py-2 rounded border ${
          isErasing
            ? "bg-red-500 text-white"
            : "bg-gray-200 text-black border-gray-300"
        }`}
      >
        🧹 지우기
      </button>
      <button
        onClick={onClear}
        className="px-3 py-2 rounded border bg-red-400 text-white border-gray-300"
      >
        ❌ 전체 지우기
      </button>
      <FileUploader
        onUpload={onUpload}
        fileName={fileName}
        onClear={onClearBackground}
      />
    </div>
  );
};

export default Toolbar;
