import { useEffect, useState } from "react";

import useAuthStore from "../store/authStore";
import { useParams } from "react-router-dom";

import PDFRenderer from "../components/PDFRenderer";
import Toolbar from "./Toolbar";
import useCanvas from "../hooks/useCanvas";
import useSocketHandlers from "../hooks/useSocketHandlers";
import useBackground from "../hooks/useBackground";
import DrawingCanvas from "./DrawingCanvas";
import ChatBox from "./ChatBox";

const Whiteboard = () => {
  const [isErasing, setIsErasing] = useState(false);

  const user = useAuthStore((state) => state.user);
  const { id } = useParams();
  const roomId = id!;

  // ✏️ 그리기 기능 (캔버스 관련 로직 + 상태)
  const {
    canvasRef, // 캔버스 DOM에 접근하기 위한 ref
    setStrokes, // 외부에서 stroke 상태를 갱신할 때 사용
    hoveredNick, // 마우스 hover 시 보여줄 닉네임
    hoverPos, // hover 닉네임 위치
    handleMouseDown, // 마우스 클릭 (그리기 시작 or 지우기)
    draw, // 마우스 이동 시 선을 그림
    stopDrawing, // 마우스 뗄 때 그리기 종료
    handleHover, // 닉네임 hover 감지
    clearCanvas, // 전체 지우기 (내 stroke만)
    undo,
  } = useCanvas({ user, roomId });

  // 🌐 소켓 연결 및 실시간 동기화 처리 (서버에서 받아온 stroke 동기화)
  useSocketHandlers({ roomId: roomId!, setStrokes });

  // 🖼️ PDF 또는 이미지 배경 처리 (업로드, 사이즈, URL 관리)
  const {
    backgroundUrl, // 백그라운드 이미지 또는 PDF의 URL
    setPdfSize, // PDF 사이즈 설정 함수 (PDFRenderer에서 호출)
    pdfSize, // 현재 렌더링할 PDF의 사이즈
    handleFileUpload, // input[type=file]에서 호출되는 업로드 함수
    clearBackground, // background 이미지 또는 pdf의 url 초기화
    fileName,
  } = useBackground(roomId);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "z") {
        undo(); // useCanvas 훅에서 받아온 함수
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo]);
  return (
    <div className="flex flex-col items-center h-full w-full">
      <Toolbar
        isErasing={isErasing}
        onToggleDraw={() => setIsErasing(false)}
        onToggleErase={() => setIsErasing(true)}
        onClear={clearCanvas}
        onUpload={handleFileUpload}
        onClearBackground={clearBackground}
        fileName={fileName}
      />

      {/*  캔버스 + 백그라운드 (하단) */}
      <div className="relative w-[1000px] ">
        {backgroundUrl?.includes(".pdf") ? (
          <PDFRenderer url={backgroundUrl} onSizeChange={setPdfSize} />
        ) : (
          backgroundUrl && (
            <img
              src={backgroundUrl}
              alt="background"
              className="absolute top-0 left-0 w-[800px] h-[600px] object-contain pointer-events-none z-0"
            />
          )
        )}

        <DrawingCanvas
          canvasRef={canvasRef}
          width={pdfSize.width}
          height={pdfSize.height}
          isErasing={isErasing}
          handleMouseDown={(e) => handleMouseDown(e, isErasing)}
          draw={draw}
          handleHover={handleHover}
          stopDrawing={stopDrawing}
        />

        {/* 호버 닉네임 */}
        {hoveredNick && hoverPos && (
          <div
            className="absolute z-20 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded pointer-events-none whitespace-nowrap"
            style={{ top: hoverPos.y + 10, left: hoverPos.x + 10 }}
          >
            {hoveredNick}
          </div>
        )}
      </div>
    </div>
  );
};

export default Whiteboard;
