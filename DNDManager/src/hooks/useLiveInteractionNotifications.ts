import { useEffect, useRef } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';

interface UseLiveInteractionNotificationsProps {
  interactionId?: Id<"interactions">;
  userId?: Id<"users">;
  isDM?: boolean;
}

export const useLiveInteractionNotifications = ({
  interactionId,
  userId,
  isDM = false
}: UseLiveInteractionNotificationsProps) => {
  const previousTurnIndex = useRef<number | undefined>();
  const previousPendingActionsCount = useRef<number>(0);
  const previousStatus = useRef<string | undefined>();

  // Subscribe to real-time updates
  const interaction = useQuery(
    api.interactions.getInteractionWithParticipants,
    interactionId ? { interactionId } : 'skip'
  );
  
  const initiativeOrder = useQuery(
    api.interactions.getInitiativeOrder,
    interactionId ? { interactionId } : 'skip'
  );
  
  const pendingActions = useQuery(
    api.playerActions.getPendingPlayerActions,
    interactionId ? { interactionId } : 'skip'
  );

  useEffect(() => {
    if (!interaction || !initiativeOrder) return;

    // Check for turn changes
    if (previousTurnIndex.current !== undefined && 
        previousTurnIndex.current !== initiativeOrder.currentIndex) {
      
      const currentParticipant = initiativeOrder.initiativeOrder[initiativeOrder.currentIndex];
      if (currentParticipant) {
        // Show turn notification
        showNotification(
          'Your Turn!',
          `It's now your turn in ${interaction.name}`,
          'turn-notification'
        );
      }
    }

    // Check for new pending actions (DM only)
    if (isDM && previousPendingActionsCount.current !== undefined) {
      const newActionsCount = pendingActions?.length || 0;
      if (newActionsCount > previousPendingActionsCount.current) {
        const newActions = newActionsCount - previousPendingActionsCount.current;
        showNotification(
          'New Actions Pending',
          `${newActions} new action${newActions > 1 ? 's' : ''} require${newActions > 1 ? '' : 's'} your review`,
          'action-notification'
        );
      }
    }

    // Check for status changes
    if (previousStatus.current && previousStatus.current !== interaction.status) {
      showNotification(
        'Interaction Status Changed',
        `Status changed to: ${interaction.status?.replace(/_/g, ' ')}`,
        'status-notification'
      );
    }

    // Update refs
    previousTurnIndex.current = initiativeOrder.currentIndex;
    previousPendingActionsCount.current = pendingActions?.length || 0;
    previousStatus.current = interaction.status;
  }, [interaction, initiativeOrder, pendingActions, isDM]);

  const showNotification = (title: string, message: string, type: string) => {
    // Check if browser supports notifications
    if (!('Notification' in window)) {
      console.log('This browser does not support desktop notifications');
      return;
    }

    // Request permission if not granted
    if (Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          createNotification(title, message, type);
        }
      });
    } else if (Notification.permission === 'granted') {
      createNotification(title, message, type);
    }
  };

  const createNotification = (title: string, message: string, type: string) => {
    const notification = new Notification(title, {
      body: message,
      icon: '/favicon.ico', // You can customize this
      tag: type, // Prevents duplicate notifications
      requireInteraction: type === 'turn-notification', // Keep turn notifications visible
    });

    // Auto-close after 5 seconds (except for turn notifications)
    if (type !== 'turn-notification') {
      setTimeout(() => {
        notification.close();
      }, 5000);
    }

    // Handle notification click
    notification.onclick = () => {
      window.focus();
      notification.close();
      
      // Navigate to the interaction if it's a turn notification
      if (type === 'turn-notification' && interactionId) {
        // You can implement navigation logic here
        console.log('Navigate to interaction:', interactionId);
      }
    };
  };

  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  return {
    requestNotificationPermission,
    currentTurnIndex: initiativeOrder?.currentIndex,
    pendingActionsCount: pendingActions?.length || 0,
    interactionStatus: interaction?.status,
  };
}; 