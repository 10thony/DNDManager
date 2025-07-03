// Script to make the first user an admin
// Run this after you've signed up and have a user in the database

import { ConvexHttpClient } from "convex/browser";
import { api } from "./convex/_generated/api.js";

const convex = new ConvexHttpClient(process.env.VITE_CONVEX_URL);

async function makeFirstUserAdmin() {
  try {
    // Get all users
    const users = await convex.query(api.users.getAllUsers, { 
      requestingClerkId: "admin-setup" // This will fail, but we'll handle it
    });
    
    console.log("Users found:", users.length);
    
    if (users.length === 0) {
      console.log("No users found. Please sign up first.");
      return;
    }
    
    // Make the first user an admin
    const firstUser = users[0];
    console.log("Making user admin:", firstUser.email);
    
    await convex.mutation(api.users.updateUserRole, {
      clerkId: firstUser.clerkId,
      role: "admin"
    });
    
    console.log("✅ Successfully made", firstUser.email, "an admin!");
    
  } catch (error) {
    console.error("Error:", error.message);
    
    // If the getAllUsers query fails (because no admin exists yet),
    // we need to manually update the first user
    console.log("\nTrying alternative approach...");
    
    // You'll need to manually run this in the Convex dashboard
    console.log("Please go to your Convex dashboard and run this mutation:");
    console.log(`
    // In the Convex dashboard, run this mutation:
    await ctx.db.patch(
      (await ctx.db.query("users").first())._id,
      { role: "admin" }
    );
    `);
  }
}

makeFirstUserAdmin(); 