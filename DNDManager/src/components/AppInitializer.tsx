import { useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function AppInitializer() {
  const initializeData = useMutation(api.init.checkAndCreateDefaultCampaigns);

  useEffect(() => {
    // Call the initialization function when the component mounts
    initializeData().catch(console.error);
  }, [initializeData]);

  // This component doesn't render anything
  return null;
} 