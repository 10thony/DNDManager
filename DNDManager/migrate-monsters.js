// Migration script to add monsterIds field to existing interactions
// This script should be run after deploying the schema changes

console.log("Migration script for adding monsterIds to interactions");
console.log("This migration will:");
console.log("1. Add monsterIds field to all existing interactions");
console.log("2. Set monsterIds to an empty array for existing interactions");
console.log("3. Ensure new interactions can include monsters");

console.log("\nTo run this migration:");
console.log("1. Deploy your schema changes to Convex");
console.log("2. Call the migrateInteractionsAddMonsterIds mutation from your Convex dashboard");
console.log("3. Or call it programmatically from your application");

console.log("\nMigration function name: migrateInteractionsAddMonsterIds");
console.log("This function is defined in convex/init.ts");

// Example of how to call the migration from your application:
/*
import { useMutation } from "convex/react";
import { api } from "./convex/_generated/api";

const migrateInteractionsAddMonsterIds = useMutation(api.init.migrateInteractionsAddMonsterIds);

// Call the migration
const runMigration = async () => {
  try {
    const result = await migrateInteractionsAddMonsterIds({});
    console.log(`Migration completed. ${result.migratedCount} interactions updated.`);
  } catch (error) {
    console.error("Migration failed:", error);
  }
};
*/ 