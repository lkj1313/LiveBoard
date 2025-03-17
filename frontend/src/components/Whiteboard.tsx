import React, { useRef, useState, useEffect } from "react";

const Whiteboard = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false); // 그리기 상태 추적
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });
  const [isErasing, setIsErasing] = useState(false); // 지우개 모드 상태
  const [isMouseDown, setIsMouseDown] = useState(false); // 마우스 클릭 상태 추적

  // 그림을 그리기 시작할 때 호출되는 함수
  const startDrawing = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // 왼쪽 마우스 버튼일 때만 그리기 시작
    setIsDrawing(true); // 그리기 상태 활성화
    const canvas = canvasRef.current;
    if (canvas && e.nativeEvent) {
      const { offsetX, offsetY } = e.nativeEvent;
      setLastPosition({ x: offsetX, y: offsetY }); // 그림 시작 위치 저장
    }
  };

  // 그림 그리기 멈추기
  const stopDrawing = () => {
    setIsDrawing(false); // 그리기 상태 비활성화
  };

  // 그림 그리기
  const draw = (e: React.MouseEvent) => {
    if (!isDrawing || !isMouseDown) return; // 마우스를 클릭한 상태에서만 그리기
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return; // 컨텍스트가 없으면 종료

    const { offsetX, offsetY } = e.nativeEvent;

    ctx.beginPath();
    ctx.moveTo(lastPosition.x, lastPosition.y); // 이전 좌표로 이동
    ctx.lineTo(offsetX, offsetY); // 현재 좌표까지 선을 그림
    ctx.stroke(); // 선을 화면에 그리기

    setLastPosition({ x: offsetX, y: offsetY }); // 마지막 좌표 업데이트
  };

  // 지우기 기능 구현
  const erase = (e: React.MouseEvent) => {
    if (!isErasing || !isMouseDown) return; // 지우기 모드일 때만 지우기, 마우스 클릭 상태에서만
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { offsetX, offsetY } = e.nativeEvent;

    ctx.clearRect(offsetX - 10, offsetY - 10, 20, 20); // 현재 좌표에서 10x10px 영역을 지움
  };

  // 지우기 모드 활성화
  const activateEraseMode = () => {
    setIsErasing(true); // 지우기 모드 활성화
    setIsDrawing(false); // 그리기 비활성화
  };

  // 그리기 모드 활성화
  const activateDrawMode = () => {
    setIsDrawing(false); // 그리기 상태는 바로 활성화하지 않음
    setIsErasing(false); // 지우기 비활성화
  };

  // 마우스 상태를 추적
  const handleMouseDown = () => {
    setIsMouseDown(true); // 마우스 클릭 상태 활성화
  };

  const handleMouseUp = () => {
    setIsMouseDown(false); // 마우스 클릭 상태 비활성화
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.lineWidth = 2; // 선의 두께 설정
        ctx.strokeStyle = "black"; // 기본 선 색 설정
      }
    }
  }, []);

  return (
    <div
      style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}
    >
      {/* 그리기 모드와 지우기 모드 버튼 */}
      <div>
        <button onClick={activateDrawMode} style={{ marginRight: "10px" }}>
          그리기 모드
        </button>
        <button onClick={activateEraseMode}>지우기 모드</button>
      </div>
      {/* Canvas 요소 (그림을 그리거나 지울 수 있는 영역) */}
      <canvas
        ref={canvasRef} // canvasRef로 참조
        width="800"
        height="600"
        onMouseDown={(e) => {
          startDrawing(e);
          handleMouseDown();
        }} // 마우스를 클릭하면 그리기 시작
        onMouseUp={(e) => {
          stopDrawing();
          handleMouseUp();
        }} // 마우스를 떼면 그리기 종료
        onMouseMove={isErasing ? erase : draw} // 그리기 모드 또는 지우기 모드에 따라 처리
        style={{
          border: "1px solid #000", // 캔버스 외곽선 스타일
          cursor: isErasing ? "crosshair" : "pointer", // 지우기 모드일 때 마우스 커서 변경
        }}
      />
    </div>
  );
};

export default Whiteboard;
