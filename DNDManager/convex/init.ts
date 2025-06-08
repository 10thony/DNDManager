import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Default campaigns to create if none exist
const defaultCampaigns = [
  { name: "The Lost Mines of Phandelver" },
  { name: "Curse of Strahd" },
  { name: "Dragon Heist" },
  { name: "Tomb of Annihilation" },
  { name: "Icewind Dale: Rime of the Frostmaiden" },
];

// Check if any campaigns exist
export const checkAndCreateDefaultCampaigns = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if any campaigns exist
    const existingCampaigns = await ctx.db.query("campaigns").collect();
    
    // If no campaigns exist, create the default ones
    if (existingCampaigns.length === 0) {
      console.log("No campaigns found. Creating default campaigns...");
      
      for (const campaign of defaultCampaigns) {
        await ctx.db.insert("campaigns", {
          name: campaign.name,
          creatorId: "system", // Using "system" as the creator ID for default campaigns
          createdAt: Date.now(),
        });
      }
      
      console.log("Default campaigns created successfully!");
    }
  },
}); 