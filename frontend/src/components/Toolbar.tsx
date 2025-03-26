// components/Toolbar.tsx
import React from "react";
import FileUploader from "./FileUploader";
import Button from "./common/Button";

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
      <Button
        onClick={onToggleDraw}
        variant={!isErasing ? "primary" : "secondary"}
        className="px-3 py-2"
      >
        ✏️ 그리기
      </Button>
      <Button
        onClick={onToggleErase}
        className={`px-3 py-2 text-white rounded transition ${
          isErasing
            ? "bg-red-600 hover:bg-red-600"
            : "bg-red-400 hover:bg-red-500"
        }`}
      >
        🧹 지우기
      </Button>

      <Button onClick={onClear} variant="danger" className="px-3 py-2 t">
        🗑️ 전체 지우기
      </Button>

      <FileUploader
        onUpload={onUpload}
        fileName={fileName}
        onClear={onClearBackground}
      />
    </div>
  );
};

export default Toolbar;
