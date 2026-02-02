import { Client, GatewayIntentBits, Events } from "discord.js";
import dotenv from "dotenv";

import { addReactionCountModule } from "./modules/reactCounter.ts"
import { PrismaClient } from "./generated/prisma/index.js";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";


dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.local", override: true });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
await prisma.$connect();

const token = process.env.TOKEN ?? (() => {
  throw new Error("TOKEN environment variable is not set");
})();

const client = new Client({
  intents: [
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
  ],
  
});

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});


addReactionCountModule(client, prisma);

client.login(token);

// Cleanup on exit
process.on('SIGINT', async () => {
  console.log('\nShutting down...');
  await prisma.$disconnect();
  await pool.end();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nShutting down...');
  await prisma.$disconnect();
  await pool.end();
  process.exit(0);
});