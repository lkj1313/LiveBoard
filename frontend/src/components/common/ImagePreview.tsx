const ImagePreview = ({ src }: { src: string }) => {
  return (
    <div className="mt-4">
      <img
        src={src}
        alt="미리보기"
        className="w-32 h-32 object-cover rounded-lg"
      />
    </div>
  );
};

export default ImagePreview;
