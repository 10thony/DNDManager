import { useEffect, useRef, useCallback } from 'react';
import { useUser, useClerk } from '@clerk/clerk-react';

interface UseSessionTimeoutOptions {
  timeoutMinutes?: number;
  warningMinutes?: number;
  onTimeout?: () => void;
  onWarning?: () => void;
}

export const useSessionTimeout = ({
  timeoutMinutes = 10,
  warningMinutes = 2,
  onTimeout,
  onWarning
}: UseSessionTimeoutOptions = {}) => {
  const { user } = useUser();
  const { signOut } = useClerk();
  const timeoutRef = useRef<number>();
  const warningRef = useRef<number>();
  const lastActivityRef = useRef<number>(Date.now());
  const isWarningShownRef = useRef<boolean>(false);

  const resetTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    isWarningShownRef.current = false;
    
    // Clear existing timers
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);
    
    // Set new timers
    const warningTime = (timeoutMinutes - warningMinutes) * 60 * 1000;
    const timeoutTime = timeoutMinutes * 60 * 1000;
    
    warningRef.current = setTimeout(() => {
      isWarningShownRef.current = true;
      onWarning?.();
    }, warningTime);
    
    timeoutRef.current = setTimeout(() => {
      onTimeout?.();
      signOut();
    }, timeoutTime);
  }, [timeoutMinutes, warningMinutes, onTimeout, onWarning, signOut]);

  const handleUserActivity = useCallback(() => {
    if (!isWarningShownRef.current) {
      resetTimer();
    }
  }, [resetTimer]);

  useEffect(() => {
    if (!user) return;

    // Set up activity listeners
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, handleUserActivity, true);
    });

    // Initial timer setup
    resetTimer();

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity, true);
      });
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
    };
  }, [user, handleUserActivity, resetTimer]);

  return {
    resetTimer,
    lastActivity: lastActivityRef.current,
    isWarningShown: isWarningShownRef.current
  };
}; 