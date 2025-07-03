import { useCallback } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

export const useSessionLogger = () => {
  const logSessionActivity = useMutation(api.sessions.logActivity);

  const logActivity = useCallback((activityType: string, details?: any) => {
    logSessionActivity({
      activityType,
      details: details || {},
      timestamp: Date.now()
    });
  }, [logSessionActivity]);

  return { logActivity };
}; 