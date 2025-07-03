import { mutation } from "./_generated/server";

// Check if any campaigns exist
export const checkAndCreateDefaultCampaigns = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if any campaigns exist
    const existingCampaigns = await ctx.db.query("campaigns").collect();
    
    // If no campaigns exist, create the default ones
    // TODO: Fix creatorId type issue - need to create a system user or modify schema
    if (existingCampaigns.length === 0) {
      console.log("No campaigns found. Creating default campaigns...");
      
      // Note: creatorId type issue needs to be resolved
      // for (const campaign of defaultCampaigns) {
      //   await ctx.db.insert("campaigns", {
      //     name: campaign.name,
      //     creatorId: "system", // Using "system" as the creator ID for default campaigns
      //     createdAt: Date.now(),
      //   });
      // }
      
      console.log("Default campaigns creation skipped due to type issues");
    }
  },
});

export const migrateInteractionsAddMonsterIds = mutation({
  args: {},
  handler: async (ctx) => {
    // Get all existing interactions that don't have monsterIds field
    const interactions = await ctx.db.query("interactions").collect();
    
    let migratedCount = 0;
    
    for (const interaction of interactions) {
      // Check if monsterIds field doesn't exist or is undefined
      if (!("monsterIds" in interaction) || interaction.monsterIds === undefined) {
        await ctx.db.patch(interaction._id, {
          monsterIds: [],
        });
        migratedCount++;
      }
    }
    
    console.log(`Migrated ${migratedCount} interactions to include monsterIds field`);
    return { migratedCount };
  },
}); 