import { useState, useEffect } from 'react';

export function useTimer() {
  const [seconds, setSeconds] = useState(0); // Inicia em 00:00
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isActive) {
      // Contagem progressiva: soma 1 segundo a cada segundo
      interval = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const toggleTimer = () => setIsActive((prev) => !prev);
  
  const resetTimer = () => {
    setIsActive(false);
    setSeconds(0);
  };

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    seconds,
    setSeconds,
    isActive,
    toggleTimer,
    resetTimer,
    formatTime
  };
}