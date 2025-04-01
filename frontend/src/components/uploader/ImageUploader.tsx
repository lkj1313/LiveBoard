// components/ImageUploader.tsx
import React, { useRef } from "react";
import Button from "../common/Button";

interface ImageUploaderProps {
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onUpload }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <>
      <Button
        onClick={handleClick}
        title="이미지 넣기"
        className="bg-white border px-3 py-2"
      >
        🖼️
      </Button>
      <input
        type="file"
        accept="image/*"
        onChange={onUpload}
        ref={inputRef}
        className="hidden"
      />
    </>
  );
};

export default ImageUploader;
