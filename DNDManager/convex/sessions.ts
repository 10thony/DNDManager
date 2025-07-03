import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createSession = mutation({
  args: {
    clerkId: v.string(),
    userAgent: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const sessionId = await ctx.db.insert("userSessions", {
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
    sessionId: v.id("userSessions"),
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
    sessionId: v.id("userSessions"),
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

    // For now, we'll create a temporary session ID since we don't have
    // a way to track the current session ID easily
    // In a full implementation, you'd want to track the current session
    const tempSessionId = await ctx.db.insert("userSessions", {
      clerkId: identity.subject,
      startTime: Date.now(),
      lastActivity: Date.now(),
      isActive: true,
    });

    await ctx.db.insert("userSessionActivities", {
      sessionId: tempSessionId,
      clerkId: identity.subject,
      activityType: args.activityType,
      details: args.details,
      timestamp: args.timestamp,
    });
  },
});

export const getActiveSessions = query({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("userSessions")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

export const getSessionActivities = query({
  args: {
    sessionId: v.id("userSessions"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("userSessionActivities")
      .filter((q) => q.eq(q.field("sessionId"), args.sessionId))
      .order("desc")
      .collect();
  },
}); 