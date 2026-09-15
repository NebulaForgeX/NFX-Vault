import { useCallback, useEffect, useState } from "react";

export function useResendTimer() {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (timeLeft <= 0) return undefined;
    const id = window.setInterval(() => {
      setTimeLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [timeLeft]);

  const startTimer = useCallback((seconds: number = 60) => {
    setTimeLeft(seconds);
  }, []);

  const canResend = timeLeft === 0;

  return { timeLeft, canResend, startTimer };
}
