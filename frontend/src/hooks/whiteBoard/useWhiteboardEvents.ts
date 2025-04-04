import { useEffect } from "react";

type Props = {
  undo: () => void;
  setContextMenuPos: React.Dispatch<
    React.SetStateAction<{ x: number; y: number } | null>
  >;
  setRightClickedImageId: React.Dispatch<React.SetStateAction<string | null>>;
};

const useWhiteboardEvents = ({
  undo,
  setContextMenuPos,
  setRightClickedImageId,
}: Props) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "z") {
        e.preventDefault(); // 브라우저 기본 동작 방지
        undo();
      }
    };

    const handleClickOutside = () => {
      setRightClickedImageId(null);
      setContextMenuPos(null);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("click", handleClickOutside);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("click", handleClickOutside);
    };
  }, [undo, setContextMenuPos, setRightClickedImageId]);
};

export default useWhiteboardEvents;
