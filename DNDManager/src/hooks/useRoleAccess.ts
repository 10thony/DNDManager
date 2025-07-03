import { useUser } from '@clerk/clerk-react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

export const useRoleAccess = () => {
  const { user } = useUser();
  const userRole = useQuery(api.users.getUserRole, 
    user?.id ? { clerkId: user.id } : "skip"
  );

  const isAdmin = userRole === "admin";
  const isUser = userRole === "user";
  const isAuthenticated = !!user;

  const canViewCampaign = (campaign: any) => {
    if (!campaign) return false;
    if (isAdmin) return true;
    if (!isAuthenticated) return campaign.isPublic;
    
    return (
      campaign.isPublic ||
      campaign.dmId === user?.id ||
      campaign.players?.includes(user?.id)
    );
  };

  const canEditCampaign = (campaign: any) => {
    if (!campaign) return false;
    if (isAdmin) return true;
    if (!isAuthenticated) return false;
    
    return campaign.dmId === user?.id;
  };

  const canDeleteCampaign = () => {
    return isAdmin;
  };

  const canCreateCampaign = () => {
    return isAuthenticated;
  };

  return {
    user,
    userRole,
    isAdmin,
    isUser,
    isAuthenticated,
    canViewCampaign,
    canEditCampaign,
    canDeleteCampaign,
    canCreateCampaign,
  };
}; 