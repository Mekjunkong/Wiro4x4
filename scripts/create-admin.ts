import "dotenv/config";
import { hashPassword } from "../server/auth";
import { getDb } from "../server/db/connection";
import { users } from "../drizzle/schema";

async function main() {
  const email = process.argv[2];
  const password = process.argv[3];

  if (!email || !password) {
    console.error("Usage: npx tsx scripts/create-admin.ts <email> <password>");
    process.exit(1);
  }

  if (password.length < 8) {
    console.error("Password must be at least 8 characters");
    process.exit(1);
  }

  const db = await getDb();
  if (!db) {
    console.error("Database not available. Check DATABASE_URL.");
    process.exit(1);
  }

  const passwordHash = await hashPassword(password);

  try {
    await db.insert(users).values({
      email,
      passwordHash,
      name: "Admin",
      role: "admin",
      lastSignedIn: new Date(),
    });
    console.log(`Admin user created: ${email}`);
  } catch (error: any) {
    if (error.message?.includes("Duplicate")) {
      console.error(`User with email ${email} already exists`);
    } else {
      console.error("Failed to create admin:", error);
    }
    process.exit(1);
  }

  process.exit(0);
}

main();
