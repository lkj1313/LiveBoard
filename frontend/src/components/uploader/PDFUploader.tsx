import { useRef } from "react";
import InputField from "../common/InputField";
import Button from "../common/Button";

interface UploadProps {
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  fileName: string;
}

const PDFUploader = ({ onUpload, onClear, fileName }: UploadProps) => {
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
      선택된 PDF : {fileName}
      {/* X 버튼 (우측 상단) */}
      {fileName !== "선택된 파일 없음" && (
        <Button
          onClick={(e) => {
            e.stopPropagation();
            handleClear();
          }}
          variant="danger"
          className="absolute -top-2 -right-2 w-5 h-5 p-0 text-xs flex items-center justify-center rounded-full"
          title="파일 제거"
        >
          ×
        </Button>
      )}
      {/* 숨겨진 파일 input */}
      <InputField
        id="file-upload"
        type="file"
        onChange={onUpload}
        value=""
        ref={inputRef}
        className="hidden"
        required={false}
        label=""
        accept="application/pdf,image/*"
      />
    </div>
  );
};

export default PDFUploader;
