import { ClerkProvider as BaseClerkProvider } from "@clerk/clerk-react";
import { useConvexAuth } from "convex/react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useEffect } from "react";

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

export function ClerkProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useConvexAuth();
  const createOrUpdateUser = useMutation(api.users.createOrUpdateUser);

  useEffect(() => {
    if (isAuthenticated && user) {
      createOrUpdateUser({
        clerkId: user.id,
        email: user.emailAddresses[0]?.emailAddress || "",
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        imageUrl: user.imageUrl || undefined,
      });
    }
  }, [isAuthenticated, user, createOrUpdateUser]);

  return (
    <BaseClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      {children}
    </BaseClerkProvider>
  );
} 