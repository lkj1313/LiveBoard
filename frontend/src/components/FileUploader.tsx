import { useRef } from "react";

interface UploadProps {
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  fileName: string;
}

const FileUploader = ({ onUpload, onClear, fileName }: UploadProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleClick = () => {
    inputRef.current?.click(); // 클릭하면 파일 선택창 열기
  };

  const handleClear = () => {
    onClear();
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div
      className="relative border border-gray-300 rounded px-4 py-2 text-sm text-gray-700 bg-white w-fit min-w-[220px] cursor-pointer"
      onClick={handleClick}
    >
      선택된 파일: {fileName}
      {/* X 버튼 (우측 상단) */}
      {fileName !== "선택된 파일 없음" && (
        <button
          onClick={(e) => {
            e.stopPropagation(); // X 버튼 클릭 시 input 안 열리게 막기
            handleClear();
          }}
          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center hover:bg-red-600"
          title="파일 제거"
        >
          ×
        </button>
      )}
      {/* 숨겨진 파일 input */}
      <input
        type="file"
        accept="application/pdf,image/*"
        onChange={onUpload}
        ref={inputRef}
        className="hidden"
      />
    </div>
  );
};

export default FileUploader;
