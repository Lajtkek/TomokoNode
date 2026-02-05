import { Client, GatewayIntentBits, Events, Partials, Collection, REST, Routes } from "discord.js";
import dotenv from "dotenv";

import { addReactionCountModule } from "./modules/reactCounter.ts"
import { addTomokoReplyModule } from "./modules/tomokoReply.ts"
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
	partials: [Partials.Message, Partials.Reaction, Partials.Channel],

});

client.once(Events.ClientReady, (readyClient) => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

// handle null
const chatGpt = new ChatGPTAPI({ apiKey: process.env.OPEN_AI_API_KEY ?? "" })

addReactionCountModule(client, prisma);
addTomokoReplyModule(client, prisma, chatGpt)

// commands START
client.commands = new Collection();
client.prisma = prisma;

import debugCommands from "./commands/debug/debug.ts"
import { ChatGPTAPI } from "chatgpt";
const commands = [debugCommands]

for (const command of commands) {
	client.commands.set(command.data.name, command);
}
client.on(Events.InteractionCreate, async (interaction) => {
	if (!interaction.isChatInputCommand()) return;
	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		// Check if interaction is still valid before trying to reply
		if (!interaction.isRepliable()) {
			console.error('Interaction is no longer repliable');
			return;
		}

		try {
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({
					content: 'There was an error while executing this command!',
					ephemeral: true
				});
			} else {
				await interaction.reply({
					content: 'There was an error while executing this command!',
					ephemeral: true
				});
			}
		} catch (replyError) {
			console.error('Failed to send error message:', replyError);
		}
	}
});

const rest = new REST({ version: "10" }).setToken(token);
const clientId = process.env.CLIENT_ID ?? (() => {
	throw new Error("CLIENT_ID environment variable is not set");
})();

const guildId = process.env.GUILD_ID ?? (() => {
	throw new Error("GUID_ID environment variable is not set");
})();
// and deploy your commands!
(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		const commandsPayload = commands.map(c => c.data.toJSON());
		console.log("payload:", JSON.stringify(commandsPayload, null, 2));
		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commandsPayload }) as any; // find type

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();
//commands end

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