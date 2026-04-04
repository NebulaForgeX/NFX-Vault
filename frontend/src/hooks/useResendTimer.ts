import { useCallback, useEffect, useState } from "react";

/**
 * 与 Pqttec-Admin `useResendTimer` 行为一致（本地倒计时）。
 */
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
