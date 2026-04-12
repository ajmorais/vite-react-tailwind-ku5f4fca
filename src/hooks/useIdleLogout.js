import { useEffect } from 'react';

export default function useIdleLogout({ enabled, onLogout, timeoutMs = 10 * 60 * 1000 }) {
  useEffect(() => {
    if (!enabled || typeof onLogout !== 'function') return;

    let timeoutId;
    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(onLogout, timeoutMs);
    };

    ['mousemove', 'keydown', 'click', 'scroll'].forEach((evt) => {
      window.addEventListener(evt, resetTimer);
    });

    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      ['mousemove', 'keydown', 'click', 'scroll'].forEach((evt) => {
        window.removeEventListener(evt, resetTimer);
      });
    };
  }, [enabled, onLogout, timeoutMs]);
}
