import { ChatInputCommandInteraction, EmbedBuilder, ButtonBuilder, SlashCommandBuilder, ButtonStyle, ActionRowBuilder } from "discord.js";

export default {
	data: new SlashCommandBuilder()
		.setName('remind-me')
		.addStringOption(option =>
			option
			.setName('remind-at')
			.setDescription('When should I remind you? (e.g. 2026-02-10 18:00)')
			.setRequired(true)
		)
		.addStringOption(option =>
			option
			.setName('remind-text')
			.setDescription('What should I remind you about?')
			.setRequired(true)
		)
		.setDescription('Creates event that reminds user'),
	async execute(interaction: ChatInputCommandInteraction) {
		const remindAt = interaction.options.getString('remind-at', true);
 		const remindText = interaction.options.getString('remind-text', true);

		await interaction.deferReply();

		const embed = new EmbedBuilder()
			.setTitle(`Píšu si`)
			.setDescription(`Připomenout ${remindText} ${remindAt}`)
			.setColor(0x5865f2);

		const button = new ButtonBuilder()
			.setCustomId('my_button_id')
			.setLabel('Taky chci připomenout :)')
			.setStyle(ButtonStyle.Primary);

		const row = new ActionRowBuilder().addComponents(button);

		await interaction.editReply({
			embeds: [embed],
  			components: [row.toJSON()],
		})
	},
};