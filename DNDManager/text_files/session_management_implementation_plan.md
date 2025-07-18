# Session Management Implementation Plan

## Overview
Currently, the D&D Manager application uses Clerk for authentication but lacks session timeout functionality. Users remain logged in indefinitely, which poses security risks. This plan outlines the implementation of automatic logout after 10 minutes of idle time.

## Current State Analysis

### Authentication System
- **Provider**: Clerk (@clerk/clerk-react v5.31.9)
- **Current Behavior**: Users stay logged in until manually signing out
- **Session Storage**: Clerk handles session persistence in browser storage
- **No Idle Detection**: No mechanism to detect user inactivity

### Application Structure
- React + TypeScript + Vite
- Convex backend for data management
- React Router for navigation
- Protected routes using Clerk's `SignedIn`/`SignedOut` components

## Implementation Strategy

### Phase 1: Core Session Management (Priority: High)

#### 1.1 Create Session Management Hook
**File**: `src/hooks/useSessionTimeout.ts`

```typescript
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
  const timeoutRef = useRef<NodeJS.Timeout>();
  const warningRef = useRef<NodeJS.Timeout>();
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
```

#### 1.2 Create Session Warning Modal Component
**File**: `src/components/SessionWarningModal.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import './SessionWarningModal.css';

interface SessionWarningModalProps {
  isOpen: boolean;
  onExtend: () => void;
  onLogout: () => void;
  remainingSeconds: number;
}

export const SessionWarningModal: React.FC<SessionWarningModalProps> = ({
  isOpen,
  onExtend,
  onLogout,
  remainingSeconds
}) => {
  const [countdown, setCountdown] = useState(remainingSeconds);

  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          onLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, onLogout]);

  if (!isOpen) return null;

  return (
    <div className="session-warning-overlay">
      <div className="session-warning-modal">
        <div className="session-warning-header">
          <h2>Session Timeout Warning</h2>
        </div>
        <div className="session-warning-content">
          <p>Your session will expire in <strong>{countdown}</strong> seconds due to inactivity.</p>
          <p>Would you like to extend your session?</p>
        </div>
        <div className="session-warning-actions">
          <button 
            className="session-warning-extend-btn"
            onClick={onExtend}
          >
            Extend Session
          </button>
          <button 
            className="session-warning-logout-btn"
            onClick={onLogout}
          >
            Sign Out Now
          </button>
        </div>
      </div>
    </div>
  );
};
```

#### 1.3 Create Session Warning Modal Styles
**File**: `src/components/SessionWarningModal.css`

```css
.session-warning-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.session-warning-modal {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.dark .session-warning-modal {
  background: #1f2937;
  color: #f9fafb;
}

.session-warning-header h2 {
  margin: 0 0 1rem 0;
  color: #dc2626;
  font-size: 1.5rem;
  font-weight: 600;
}

.session-warning-content {
  margin-bottom: 1.5rem;
}

.session-warning-content p {
  margin: 0.5rem 0;
  line-height: 1.5;
}

.session-warning-content strong {
  color: #dc2626;
  font-weight: 600;
}

.session-warning-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.session-warning-extend-btn {
  background: #2563eb;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.session-warning-extend-btn:hover {
  background: #1d4ed8;
}

.session-warning-logout-btn {
  background: #dc2626;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.session-warning-logout-btn:hover {
  background: #b91c1c;
}
```

### Phase 2: Integration with App Component

#### 2.1 Update App.tsx
**File**: `src/App.tsx`

```typescript
// Add imports
import { useSessionTimeout } from './hooks/useSessionTimeout';
import { SessionWarningModal } from './components/SessionWarningModal';
import { useState } from 'react';

const App: React.FC = () => {
  const [navCollapsed, setNavCollapsed] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  const { resetTimer } = useSessionTimeout({
    timeoutMinutes: 10,
    warningMinutes: 2,
    onWarning: () => setShowWarning(true),
    onTimeout: () => setShowWarning(false)
  });

  const handleExtendSession = () => {
    setShowWarning(false);
    resetTimer();
  };

  const handleLogout = () => {
    setShowWarning(false);
    // Clerk will handle the actual logout
  };

  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <ConvexProvider client={convex}>
        <DarkModeProvider>
          <UserSync />
          <UserDebug />
          <Router>
            <div className="app">
              <Navigation isCollapsed={navCollapsed} setIsCollapsed={setNavCollapsed} />
              <main className={`main-content${navCollapsed ? " collapsed" : ""}`}>
                {/* Existing routes */}
              </main>
            </div>
            <SessionWarningModal
              isOpen={showWarning}
              onExtend={handleExtendSession}
              onLogout={handleLogout}
              remainingSeconds={120} // 2 minutes
            />
          </Router>
        </DarkModeProvider>
      </ConvexProvider>
    </ClerkProvider>
  );
};
```

### Phase 3: Enhanced Features (Optional)

#### 3.1 Session Configuration Component
**File**: `src/components/SessionSettings.tsx`

```typescript
import React, { useState } from 'react';
import { useUser } from '@clerk/clerk-react';

interface SessionSettingsProps {
  onSettingsChange: (settings: SessionSettings) => void;
  currentSettings: SessionSettings;
}

interface SessionSettings {
  timeoutMinutes: number;
  warningMinutes: number;
  enableIdleDetection: boolean;
}

export const SessionSettings: React.FC<SessionSettingsProps> = ({
  onSettingsChange,
  currentSettings
}) => {
  const { user } = useUser();
  const [settings, setSettings] = useState(currentSettings);

  const handleSettingChange = (key: keyof SessionSettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    onSettingsChange(newSettings);
  };

  if (!user) return null;

  return (
    <div className="session-settings">
      <h3>Session Settings</h3>
      <div className="setting-group">
        <label>
          <input
            type="checkbox"
            checked={settings.enableIdleDetection}
            onChange={(e) => handleSettingChange('enableIdleDetection', e.target.checked)}
          />
          Enable idle session detection
        </label>
      </div>
      <div className="setting-group">
        <label>
          Session timeout (minutes):
          <input
            type="number"
            min="1"
            max="60"
            value={settings.timeoutMinutes}
            onChange={(e) => handleSettingChange('timeoutMinutes', parseInt(e.target.value))}
            disabled={!settings.enableIdleDetection}
          />
        </label>
      </div>
      <div className="setting-group">
        <label>
          Warning before timeout (minutes):
          <input
            type="number"
            min="1"
            max={settings.timeoutMinutes - 1}
            value={settings.warningMinutes}
            onChange={(e) => handleSettingChange('warningMinutes', parseInt(e.target.value))}
            disabled={!settings.enableIdleDetection}
          />
        </label>
      </div>
    </div>
  );
};
```

#### 3.2 Session Activity Logger
**File**: `src/hooks/useSessionLogger.ts`

```typescript
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
```

### Phase 4: Backend Support (Convex)

#### 4.1 Session Schema
**File**: `convex/schema.ts`

```typescript
// Add to existing schema
sessions: defineTable({
  clerkId: v.string(),
  startTime: v.number(),
  lastActivity: v.number(),
  isActive: v.boolean(),
  userAgent: v.optional(v.string()),
  ipAddress: v.optional(v.string()),
}),

sessionActivities: defineTable({
  sessionId: v.id("sessions"),
  clerkId: v.string(),
  activityType: v.string(),
  details: v.any(),
  timestamp: v.number(),
}),
```

#### 4.2 Session Management Functions
**File**: `convex/sessions.ts`

```typescript
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createSession = mutation({
  args: {
    clerkId: v.string(),
    userAgent: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const sessionId = await ctx.db.insert("sessions", {
      clerkId: args.clerkId,
      startTime: Date.now(),
      lastActivity: Date.now(),
      isActive: true,
      userAgent: args.userAgent,
      ipAddress: args.ipAddress,
    });
    return sessionId;
  },
});

export const updateSessionActivity = mutation({
  args: {
    sessionId: v.id("sessions"),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.sessionId, {
      lastActivity: Date.now(),
    });
  },
});

export const endSession = mutation({
  args: {
    sessionId: v.id("sessions"),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.sessionId, {
      isActive: false,
    });
  },
});

export const logActivity = mutation({
  args: {
    activityType: v.string(),
    details: v.any(),
    timestamp: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    await ctx.db.insert("sessionActivities", {
      sessionId: "temp", // Would need to track current session ID
      clerkId: identity.subject,
      activityType: args.activityType,
      details: args.details,
      timestamp: args.timestamp,
    });
  },
});
```

## Implementation Timeline

### Week 1: Core Implementation
- [ ] Create `useSessionTimeout` hook
- [ ] Create `SessionWarningModal` component
- [ ] Add CSS styles for modal
- [ ] Integrate with App.tsx
- [ ] Test basic functionality

### Week 2: Testing & Refinement
- [ ] Test edge cases (browser refresh, tab switching)
- [ ] Test with different timeout values
- [ ] Test warning modal behavior
- [ ] Fix any issues found

### Week 3: Enhanced Features (Optional)
- [ ] Add session settings component
- [ ] Implement session activity logging
- [ ] Add backend session tracking
- [ ] Create admin session monitoring

### Week 4: Documentation & Deployment
- [ ] Update user documentation
- [ ] Create admin guide for session management
- [ ] Deploy to production
- [ ] Monitor for issues

## Configuration Options

### Default Settings
- **Session Timeout**: 10 minutes
- **Warning Time**: 2 minutes before timeout
- **Activity Detection**: Mouse, keyboard, touch, scroll events
- **Warning Modal**: Non-dismissible, requires user action

### Customizable Settings
- Session timeout duration (1-60 minutes)
- Warning time before timeout
- Enable/disable idle detection
- Activity event types to monitor

## Security Considerations

### Session Security
- Sessions are tied to Clerk authentication
- Automatic logout on timeout prevents unauthorized access
- Activity detection prevents session hijacking
- Warning modal gives users control over session extension

### Privacy
- No sensitive data stored in session logs
- Session activity logs are optional and configurable
- IP addresses and user agents are optional fields

## Testing Strategy

### Unit Tests
- Test `useSessionTimeout` hook with different configurations
- Test warning modal countdown functionality
- Test activity detection event listeners

### Integration Tests
- Test complete session flow from login to timeout
- Test session extension functionality
- Test logout behavior

### User Acceptance Tests
- Test with real users to ensure UX is acceptable
- Test on different devices and browsers
- Test with various user activity patterns

## Monitoring & Analytics

### Session Metrics
- Average session duration
- Session timeout frequency
- User extension rate
- Activity patterns

### Error Tracking
- Session creation failures
- Timer reset issues
- Modal display problems

## Future Enhancements

### Advanced Features
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

## Conclusion

This implementation plan provides a comprehensive solution for session management with automatic logout after idle time. The phased approach allows for incremental deployment and testing, while the modular design makes it easy to extend and customize the functionality.

The solution balances security requirements with user experience, providing clear warnings and the ability to extend sessions when needed. The implementation is designed to work seamlessly with the existing Clerk authentication system and React application architecture.
