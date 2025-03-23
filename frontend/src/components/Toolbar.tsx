// components/Toolbar.tsx
import React from "react";

interface ToolbarProps {
  isErasing: boolean;
  onToggleDraw: () => void;
  onToggleErase: () => void;
  onClear: () => void;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  isErasing,
  onToggleDraw,
  onToggleErase,
  onClear,
  onUpload,
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
      <input
        type="file"
        accept="application/pdf,image/*"
        onChange={onUpload}
        className="px-3 py-2 rounded border border-gray-300 bg-lime-400 text-black"
      />
    </div>
  );
};

export default Toolbar;
