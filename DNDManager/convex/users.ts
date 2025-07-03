import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createOrUpdateUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    role: v.optional(v.union(v.literal("admin"), v.literal("user"))),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .first();

    if (existingUser) {
      return await ctx.db.patch(existingUser._id, {
        email: args.email,
        firstName: args.firstName,
        lastName: args.lastName,
        imageUrl: args.imageUrl,
        role: args.role || existingUser.role || "user", // Default to user if not specified
      });
    }

    return await ctx.db.insert("users", {
      ...args,
      role: args.role || "user", // Default to user for new users
      createdAt: Date.now(),
    });
  },
});

export const getUserByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .first();
  },
});

export const getUserRole = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .first();
    
    return user?.role || "user";
  },
});

export const updateUserRole = mutation({
  args: {
    clerkId: v.string(),
    role: v.union(v.literal("admin"), v.literal("user")),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .first();
    
    if (!user) {
      throw new Error("User not found");
    }
    
    await ctx.db.patch(user._id, {
      role: args.role,
    });
  },
});

export const getAllUsers = query({
  args: { requestingClerkId: v.string() },
  handler: async (ctx, args) => {
    // Check if the requesting user is an admin
    const requestingUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.requestingClerkId))
      .first();
    
    if (!requestingUser || requestingUser.role !== "admin") {
      throw new Error("Unauthorized: Only admins can view all users");
    }
    
    // Return all users with their roles
    return await ctx.db.query("users").collect();
  },
});

export const deleteUser = mutation({
  args: { 
    targetClerkId: v.string(),
    requestingClerkId: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if the requesting user is an admin
    const requestingUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.requestingClerkId))
      .first();
    
    if (!requestingUser || requestingUser.role !== "admin") {
      throw new Error("Unauthorized: Only admins can delete users");
    }
    
    // Prevent admin from deleting themselves
    if (args.targetClerkId === args.requestingClerkId) {
      throw new Error("Cannot delete your own account");
    }
    
    const targetUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.targetClerkId))
      .first();
    
    if (!targetUser) {
      throw new Error("User not found");
    }
    
    await ctx.db.delete(targetUser._id);
  },
}); 