import React from "react";
import { useUser } from "@clerk/clerk-react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export const UserDebug: React.FC = () => {
  const { user, isSignedIn } = useUser();
  const convexUser = useQuery(api.users.getUserByClerkId, 
    user ? { clerkId: user.id } : "skip"
  );

  if (!isSignedIn) {
    return (
      <div className="fixed bottom-4 right-4 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg p-3 text-sm">
        🔒 Not signed in
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-blue-100 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700 rounded-lg p-3 text-sm max-w-xs">
      <div className="font-semibold mb-2">👤 User Debug</div>
      
      <div className="space-y-1 text-xs">
        <div><strong>Clerk ID:</strong> {user?.id?.slice(0, 8)}...</div>
        <div><strong>Email:</strong> {user?.emailAddresses[0]?.emailAddress}</div>
        <div><strong>Convex User:</strong> {convexUser ? "✅ Found" : "❌ Not found"}</div>
        {convexUser && (
          <div><strong>Role:</strong> <span className={`px-1 rounded text-xs ${convexUser.role === 'admin' ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800'}`}>
            {convexUser.role}
          </span></div>
        )}
      </div>
    </div>
  );
}; 