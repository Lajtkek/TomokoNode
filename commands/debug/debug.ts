import { ChatInputCommandInteraction, Client, MessageFlags, SlashCommandBuilder } from "discord.js";

export default {
	async init(client: Client){

	},
	data: new SlashCommandBuilder().setName('ping').setDescription('Replies with Pong! 1337'),
	async execute(interaction: ChatInputCommandInteraction) {
		await interaction.deferReply();
		
		const prisma = interaction.client.prisma;
	
		const top10 = await prisma.user.findMany({
			take: 10,
			orderBy: {
				helperScore: "desc"
			}
		})

		const topString = top10.map(x => `<@${x.id}> má ${x.helperScore}`).join('\n')

		await interaction.editReply({
			content: topString,
			allowedMentions: { repliedUser: false }
		});
	},
};