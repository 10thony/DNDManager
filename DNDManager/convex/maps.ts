import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Query to get all maps for a user
export const getUserMaps = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("maps")
      .filter((q) => q.eq(q.field("createdBy"), args.userId))
      .collect();
  },
});

// Query to get a specific map
export const getMap = query({
  args: { mapId: v.id("maps") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.mapId);
  },
});

// Mutation to create a new map
export const createMap = mutation({
  args: {
    name: v.string(),
    width: v.number(),
    height: v.number(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const { width, height } = args;
    
    // Create initial cells array with all cells set to "inbounds"
    const cells = [];
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        cells.push({
          x,
          y,
          state: "inbounds" as const,
        });
      }
    }

    return await ctx.db.insert("maps", {
      name: args.name,
      width,
      height,
      cells,
      createdBy: args.userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Mutation to update a map's cells
export const updateMapCells = mutation({
  args: {
    mapId: v.id("maps"),
    cells: v.array(v.object({
      x: v.number(),
      y: v.number(),
      state: v.union(
        v.literal("inbounds"),
        v.literal("outbounds"),
        v.literal("occupied")
      ),
    })),
  },
  handler: async (ctx, args) => {
    const map = await ctx.db.get(args.mapId);
    if (!map) throw new Error("Map not found");

    return await ctx.db.patch(args.mapId, {
      cells: args.cells,
      updatedAt: Date.now(),
    });
  },
});

// Mutation to delete a map
export const deleteMap = mutation({
  args: { mapId: v.id("maps") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.mapId);
  },
}); 