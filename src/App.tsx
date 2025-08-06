import { useEffect, useState } from "react";

function App() {
  const [isRunning, setIsRunning] = useState(false);
  const [timerMinutes, setTimerMinutes] = useState(60); // 설정된 시간 (분)
  const [remainingTime, setRemainingTime] = useState(60 * 60); // 남은 시간 (초)

  useEffect(() => {
    let interval: number | undefined;

    if (isRunning && remainingTime > 0) {
      interval = setInterval(() => {
        setRemainingTime((prevTime) => {
          if (prevTime <= 1) {
            setIsRunning(false);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, remainingTime]);

  const startTimer = () => {
    if (remainingTime > 0) {
      setIsRunning(true);
    }
  };

  const stopTimer = () => setIsRunning(false);

  const resetTimer = () => {
    setIsRunning(false);
    setRemainingTime(timerMinutes * 60);
  };

  const handleTimeChange = (minutes: number) => {
    const clampedMinutes = Math.min(Math.max(minutes, 1), 60);
    setTimerMinutes(clampedMinutes);
    setRemainingTime(clampedMinutes * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // 타이머 원형 프로그레스 계산
  const totalSeconds = timerMinutes * 60;
  const progress = remainingTime / totalSeconds;
  const circumference = 2 * Math.PI * 120; // 반지름 120

  // 설정된 시간에 비례해서 빨간색 영역의 크기 결정
  const timeRatio = timerMinutes / 60; // 60분 대비 설정된 시간의 비율
  const maxStrokeLength = circumference * timeRatio; // 설정된 시간만큼만 빨간색 영역

  // 현재 남은 시간에 비례해서 빨간색 영역이 줄어듦
  const currentStrokeLength = maxStrokeLength * progress;
  const strokeDasharray = `${currentStrokeLength} ${
    circumference - currentStrokeLength
  }`;
  const strokeDashoffset = 0;

  // 다이얼 숫자와 눈금 생성
  const generateDialElements = () => {
    const elements = [];

    for (let i = 0; i <= 60; i++) {
      const angle = i * 6; // 0분이 12시 방향, 시계방향으로 진행
      const radian = (angle * Math.PI) / 180;
      const x = 125 + 110 * Math.cos(radian);
      const y = 125 + 110 * Math.sin(radian);

      if (i % 5 === 0 && i !== 60) {
        // 5분 단위 숫자 (60 제외)
        const numberAngle = angle + 90; // 텍스트 회전 보정
        elements.push(
          <text
            key={`number-${i}`}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="12"
            fontWeight="bold"
            fill="#374151"
            transform={`rotate(${numberAngle} ${x} ${y})`}
            style={{ zIndex: 10 }}
          >
            {i}
          </text>
        );
      } else if (i !== 60) {
        // 1분 단위 눈금 (60 제외)
        const tickLength = 8;
        const tickX1 = 125 + (120 - tickLength) * Math.cos(radian);
        const tickY1 = 125 + (120 - tickLength) * Math.sin(radian);
        const tickX2 = 125 + 120 * Math.cos(radian);
        const tickY2 = 125 + 120 * Math.sin(radian);

        elements.push(
          <line
            key={`tick-${i}`}
            x1={tickX1}
            y1={tickY1}
            x2={tickX2}
            y2={tickY2}
            stroke="#9ca3af"
            strokeWidth="1"
          />
        );
      }
    }

    return elements;
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* 타이머 원형 디스플레이 */}
        <div className="relative flex justify-center mb-8">
          <svg className="w-64 h-64 transform -rotate-90" viewBox="0 0 250 250">
            {/* 배경 원 */}
            <circle
              cx="125"
              cy="125"
              r="120"
              fill="none"
              stroke="#f3f4f6"
              strokeWidth="12"
            />

            {/* 진행 원 (빨간색) - 설정된 시간만큼만 표시되고 줄어듦 */}
            <circle
              cx="125"
              cy="125"
              r="120"
              fill="none"
              stroke="#ef4444"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-linear"
            />

            {/* 다이얼 숫자와 눈금 - 빨간 원 위에 표시 */}
            {generateDialElements()}
          </svg>

          {/* 중앙 시간 표시 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl font-mono font-bold text-gray-800">
                {formatTime(remainingTime)}
              </div>
              <div className="text-sm text-gray-500 mt-1">60 Min</div>
            </div>
          </div>
        </div>

        {/* 시간 설정 입력 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            타이머 설정 (분)
          </label>
          <input
            type="number"
            min="1"
            max="60"
            value={timerMinutes}
            onChange={(e) => handleTimeChange(parseInt(e.target.value) || 1)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg"
            disabled={isRunning}
          />
        </div>

        {/* 버튼들 */}
        <div className="flex gap-4">
          <button
            onClick={resetTimer}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            초기화
          </button>

          {!isRunning ? (
            <button
              onClick={startTimer}
              disabled={remainingTime === 0}
              className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              시작
            </button>
          ) : (
            <button
              onClick={stopTimer}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              정지
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
