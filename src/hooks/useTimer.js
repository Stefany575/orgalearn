import { useState, useEffect } from 'react';

//Hook Customizado - lógica do Cronômetro
export function useTimer() {
  //Estados - variáveis de controle
  const [seconds, setSeconds] = useState(0); // Inicia em 00:00
  const [isActive, setIsActive] = useState(false);

  //Lógica do Tempo
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

  //Funções de Controle
  const toggleTimer = () => setIsActive((prev) => !prev);
  
  const resetTimer = () => {
    setIsActive(false);
    setSeconds(0);
  };

  //Formatação, coverte o tempo para formato MM:SS
  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  //Devolve as variáveis e funções para serem usadas na parte visual
  return {
    seconds,
    setSeconds,
    isActive,
    toggleTimer,
    resetTimer,
    formatTime
  };
}