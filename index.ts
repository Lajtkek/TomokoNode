import { Client, GatewayIntentBits, Events } from "discord.js";

import dotenv from "dotenv";

dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.local", override: true });

console.log(process.env.TOKEN )
const token = process.env.TOKEN ?? (() => {
  throw new Error("TOKEN environment variable is not set");
})();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, (readyClient) => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.login(token);