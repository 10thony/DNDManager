# Session Management Implementation

## Overview

The D&D Manager application now includes automatic session timeout functionality that logs users out after a period of inactivity. This implementation provides security while maintaining a good user experience through warning notifications.

## Features

### Core Functionality
- **Automatic Logout**: Users are automatically logged out after 10 minutes of inactivity
- **Warning System**: Users receive a 2-minute warning before session timeout
- **Activity Detection**: Monitors mouse, keyboard, touch, and scroll events
- **Session Extension**: Users can extend their session when the warning appears
- **Dark Mode Support**: All components support both light and dark themes

### Components

#### 1. useSessionTimeout Hook (`src/hooks/useSessionTimeout.ts`)
The core hook that manages session timeout functionality:

```typescript
const { resetTimer, lastActivity, isWarningShown } = useSessionTimeout({
  timeoutMinutes: 10,
  warningMinutes: 2,
  onWarning: () => setShowWarning(true),
  onTimeout: () => setShowWarning(false)
});
```

**Features:**
- Configurable timeout and warning periods
- Activity event listeners (mouse, keyboard, touch, scroll)
- Automatic timer reset on user activity
- Callback functions for warning and timeout events

#### 2. SessionWarningModal Component (`src/components/SessionWarningModal.tsx`)
A modal that appears when the session is about to timeout:

**Features:**
- Countdown timer showing remaining seconds
- "Extend Session" button to reset the timer
- "Sign Out Now" button for immediate logout
- Non-dismissible modal (requires user action)
- Responsive design with dark mode support

#### 3. SessionSettings Component (`src/components/SessionSettings.tsx`)
Optional component for configuring session settings:

**Features:**
- Enable/disable idle detection
- Configure timeout duration (1-60 minutes)
- Configure warning time before timeout
- Real-time validation of settings

#### 4. useSessionLogger Hook (`src/hooks/useSessionLogger.ts`)
Hook for logging session activities to the backend:

```typescript
const { logActivity } = useSessionLogger();
logActivity('page_view', { page: '/campaigns' });
```

### Backend Support

#### Database Schema (`convex/schema.ts`)
Two new tables for session tracking:

```typescript
userSessions: defineTable({
  clerkId: v.string(),
  startTime: v.number(),
  lastActivity: v.number(),
  isActive: v.boolean(),
  userAgent: v.optional(v.string()),
  ipAddress: v.optional(v.string()),
}),

userSessionActivities: defineTable({
  sessionId: v.id("userSessions"),
  clerkId: v.string(),
  activityType: v.string(),
  details: v.any(),
  timestamp: v.number(),
}),
```

#### Backend Functions (`convex/sessions.ts`)
- `createSession`: Create a new user session
- `updateSessionActivity`: Update session activity timestamp
- `endSession`: Mark session as inactive
- `logActivity`: Log user activities
- `getActiveSessions`: Query active sessions for a user
- `getSessionActivities`: Get activities for a session

## Configuration

### Default Settings
- **Session Timeout**: 10 minutes
- **Warning Time**: 2 minutes before timeout
- **Activity Events**: mousedown, mousemove, keypress, scroll, touchstart, click

### Customization
You can customize the session timeout behavior by modifying the `useSessionTimeout` hook call in `App.tsx`:

```typescript
const { resetTimer } = useSessionTimeout({
  timeoutMinutes: 15, // Custom timeout
  warningMinutes: 3,  // Custom warning time
  onWarning: () => setShowWarning(true),
  onTimeout: () => setShowWarning(false)
});
```

## Testing

### Session Test Page
A test page is available at `/session-test` for testing the session management functionality:

**Features:**
- Short timeout (1 minute) for quick testing
- Real-time display of session information
- Manual activity simulation
- Console logging for debugging

### Test Instructions
1. Navigate to `/session-test`
2. Stay idle for 30 seconds to see the warning modal
3. Stay idle for 1 minute to be automatically logged out
4. Click "Simulate Activity" to reset the timer
5. Check browser console for activity logs

## Security Considerations

### Session Security
- Sessions are tied to Clerk authentication
- Automatic logout prevents unauthorized access
- Activity detection prevents session hijacking
- Warning modal gives users control over session extension

### Privacy
- No sensitive data stored in session logs
- Session activity logs are optional and configurable
- IP addresses and user agents are optional fields

## Integration

### App.tsx Integration
The session management is integrated into the main App component using a SessionManager wrapper:

```typescript
const App: React.FC = () => {
  const [navCollapsed, setNavCollapsed] = useState(false);

  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <ConvexProvider client={convex}>
        <DarkModeProvider>
          <SessionManager>
            <UserSync />
            <UserDebug />
            <Router>
              {/* ... existing JSX */}
            </Router>
          </SessionManager>
        </DarkModeProvider>
      </ConvexProvider>
    </ClerkProvider>
  );
};
```

### SessionManager Component
The SessionManager component handles all session management logic and is rendered inside the ClerkProvider:

```typescript
export const SessionManager: React.FC<SessionManagerProps> = ({ children }) => {
  const [showWarning, setShowWarning] = useState(false);

  const { resetTimer } = useSessionTimeout({
    timeoutMinutes: 10,
    warningMinutes: 2,
    onWarning: () => setShowWarning(true),
    onTimeout: () => setShowWarning(false)
  });

  return (
    <>
      {children}
      <SessionWarningModal
        isOpen={showWarning}
        onExtend={handleExtendSession}
        onLogout={handleLogout}
        remainingSeconds={120}
      />
    </>
  );
};
```

### Navigation Integration
The session management works automatically across all protected routes and doesn't require any changes to existing components.

## Future Enhancements

### Planned Features
- Remember user preferences for session settings
- Different timeout rules for different user roles
- Session sharing between tabs
- Offline session handling
- Session recovery after browser crash

### Integration Opportunities
- Integrate with Convex real-time features
- Add session analytics dashboard
- Implement session-based rate limiting
- Add session audit trails for compliance

## Troubleshooting

### Common Issues

1. **"useUser can only be used within the <ClerkProvider /> component" error**
   - This error occurs when Clerk hooks are used outside the ClerkProvider context
   - The SessionManager component ensures all session management logic runs inside the ClerkProvider
   - Make sure the SessionManager is rendered inside the ClerkProvider in App.tsx

2. **Session timeout not working**
   - Check that the user is authenticated
   - Verify activity events are being detected
   - Check browser console for errors

3. **Warning modal not appearing**
   - Verify the warning time is less than timeout time
   - Check that the modal component is properly imported
   - Ensure the modal is rendered in the component tree

4. **Activity detection issues**
   - Verify event listeners are properly attached
   - Check for conflicting event handlers
   - Test on different browsers and devices

### Debug Mode
Enable debug logging by adding console.log statements to the `useSessionTimeout` hook:

```typescript
const handleUserActivity = useCallback(() => {
  console.log('User activity detected');
  if (!isWarningShownRef.current) {
    console.log('Resetting timer');
    resetTimer();
  }
}, [resetTimer]);
```

## Deployment

### Production Considerations
1. **Timeout Values**: Adjust timeout values for production use
2. **Activity Logging**: Consider enabling/disabling activity logging based on privacy requirements
3. **Performance**: Monitor for any performance impact from activity detection
4. **User Experience**: Test with real users to ensure acceptable UX

### Monitoring
- Monitor session timeout frequency
- Track user extension rates
- Watch for any errors in session management
- Monitor activity patterns for optimization

## Support

For issues or questions about the session management implementation:
1. Check the browser console for error messages
2. Review the test page at `/session-test`
3. Verify configuration settings
4. Test with different browsers and devices 