import { useState, useEffect, useRef } from "react";

interface AudioPlayerProps {
  textToRead: string;
  title: string;
  onClose: () => void;
  onBoundary?: (charIndex: number, charLength: number) => void;
  onEnd?: () => void;
}

export const AudioPlayer = ({
  textToRead,
  title,
  onClose,
  onBoundary,
  onEnd,
}: AudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [rate, setRate] = useState<number>(1);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const onBoundaryRef = useRef(onBoundary);
  onBoundaryRef.current = onBoundary;
  const onEndRef = useRef(onEnd);
  onEndRef.current = onEnd;

  const speedOptions = [
    { label: "0.75x", val: 0.75 },
    { label: "1x", val: 1.0 },
    { label: "1.25x", val: 1.25 },
    { label: "1.5x", val: 1.5 },
    { label: "2x", val: 2.0 },
  ];

  const currentOffsetRef = useRef<number>(0);
  const lastIndexRef = useRef<number>(0);

  const startReading = (speed: number = rate, fromIndex: number = 0) => {
    if (!("speechSynthesis" in window)) {
      alert("Text-to-speech is not supported on this browser.");
      return;
    }

    window.speechSynthesis.cancel();

    currentOffsetRef.current = fromIndex;
    lastIndexRef.current = fromIndex;
    const textSlice = textToRead.slice(fromIndex);
    if (!textSlice.trim()) {
      setIsPlaying(false);
      setIsPaused(false);
      setProgress(100);
      onEndRef.current?.();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(textSlice);
    utterance.rate = speed;
    utterance.pitch = 1.0;
    utterance.lang = "en-US";

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setProgress(100);
      lastIndexRef.current = 0;
      onEndRef.current?.();
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
      onEndRef.current?.();
    };

    const totalChars = textToRead.length;
    utterance.onboundary = (event) => {
      if (typeof event.charIndex === "number") {
        const globalCharIndex = currentOffsetRef.current + event.charIndex;
        lastIndexRef.current = globalCharIndex;

        if (totalChars > 0) {
          setProgress(Math.min(100, Math.round((globalCharIndex / totalChars) * 100)));
        }

        if (onBoundaryRef.current) {
          let length = event.charLength;
          if (!length || length <= 0) {
            const remaining = textToRead.slice(globalCharIndex);
            const match = remaining.match(/^[\w\u00C0-\u024F\u1E00-\u1EFF'-]+/);
            length = match ? match[0].length : (remaining.match(/^\S+/) ? remaining.match(/^\S+/)![0].length : 1);
          }
          onBoundaryRef.current(globalCharIndex, length);
        }
      }
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    startReading(rate, 0);

    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      onEndRef.current?.();
    };
  }, []);

  const togglePlayPause = () => {
    if (!("speechSynthesis" in window)) return;

    if (isPlaying && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    } else if (isPaused) {
      if (utteranceRef.current && utteranceRef.current.rate !== rate) {
        startReading(rate, lastIndexRef.current);
      } else {
        window.speechSynthesis.resume();
        setIsPaused(false);
      }
    } else {
      startReading(rate, lastIndexRef.current >= textToRead.length ? 0 : lastIndexRef.current);
    }
  };

  const handleSpeedChange = () => {
    const currentIdx = speedOptions.findIndex((s) => s.val === rate);
    const nextIdx = (currentIdx + 1) % speedOptions.length;
    const newRate = speedOptions[nextIdx].val;
    setRate(newRate);

    if (isPlaying && !isPaused) {
      startReading(newRate, lastIndexRef.current);
    }
  };

  const handleStop = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    lastIndexRef.current = 0;
    currentOffsetRef.current = 0;
    setIsPlaying(false);
    setIsPaused(false);
    setProgress(0);
    onEndRef.current?.();
    onClose();
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl sm:rounded-full px-5 py-3.5 shadow-[0_12px_36px_rgba(0,0,0,0.14)] flex items-center gap-4 text-gray-800 w-[92%] max-w-lg select-none">
      {/* Play / Pause */}
      <button
        onClick={togglePlayPause}
        title={isPlaying && !isPaused ? "Pause" : "Play"}
        className="w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center cursor-pointer transition shadow-2xs flex-shrink-0"
      >
        <i
          className={`bx ${isPlaying && !isPaused ? "bx-pause" : "bx-play"} text-2xl ${
            !isPlaying || isPaused ? "ml-0.5" : ""
          }`}
        ></i>
      </button>

      {/* Info & Progress */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="text-xs font-bold text-gray-900 truncate">
            {title}
          </span>
          <span className="text-[11px] font-semibold text-indigo-600 flex-shrink-0">
            {isPlaying && !isPaused ? `${progress}%` : isPaused ? "Paused" : "Ready"}
          </span>
        </div>

        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-indigo-600 h-full rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Speed Switcher */}
      <button
        onClick={handleSpeedChange}
        title="Change playback speed"
        className="text-xs font-bold text-gray-700 hover:text-indigo-600 bg-slate-100 hover:bg-slate-200/70 px-2.5 py-1.5 rounded-lg transition cursor-pointer flex-shrink-0"
      >
        {speedOptions.find((s) => s.val === rate)?.label || "1x"}
      </button>

      {/* Close Button */}
      <button
        onClick={handleStop}
        title="Stop narration"
        className="text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-slate-100 transition cursor-pointer flex-shrink-0"
      >
        <i className="bx bx-x text-xl"></i>
      </button>
    </div>
  );
};
