// components/Toolbar.tsx
import React from "react";
import FileUploader from "./FileUploader";
import Button from "./common/Button";
import { FaRegHandPaper } from "react-icons/fa";

interface ToolbarProps {
  fileName: string;
  isErasing: boolean;
  isImageDragMode: boolean;
  onToggleDraw: () => void;
  onToggleErase: () => void;
  onToggleImageDragMode: () => void;
  onClear: () => void;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearBackground: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  isErasing,
  onToggleDraw,
  onToggleErase,
  onToggleImageDragMode,
  onClear,
  onUpload,
  onClearBackground,
  fileName,
  isImageDragMode,
}) => {
  return (
    <div className="flex gap-2 mb-4 py-2  bg-white bg-opacity-80 rounded shadow z-10">
      <Button
        onClick={onToggleImageDragMode}
        variant={isImageDragMode ? "primary" : "ghost"}
        title="이미지 이동"
        className="px-3 py-2"
      >
        🖐️
      </Button>

      <Button
        onClick={onToggleDraw}
        variant={!isImageDragMode && !isErasing ? "primary" : "ghost"}
        title="그리기"
        className="px-3 py-2"
      >
        ✏️
      </Button>

      <Button
        onClick={onToggleErase}
        variant={isErasing ? "primary" : "ghost"}
        title="지우기"
        className="px-3 py-2"
      >
        🧹
      </Button>

      <Button
        onClick={onClear}
        variant="danger" // 전체 지우기는 항상 빨간색으로 유지
        title="전체 지우기"
        className="px-3 py-2"
      >
        🗑️
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
