import { ChatInputCommandInteraction, EmbedBuilder, ButtonBuilder, SlashCommandBuilder, ButtonStyle, ActionRowBuilder, type ButtonInteraction, Client } from "discord.js";

const REMINDER_BUTTON_ID_PREFIX = "remind-me_"

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

		const client = interaction.client;
		const prisma = client.prisma;
		const userInDb = await client.userService.getDbUser(interaction.user);

		const reminder = await prisma.reminder.create({
			data: {
				idOwner: userInDb.id,
				recipients: {
					create: [{
						userId: userInDb.id
					}]
				},
				description: remindText
			}
		})

		const embed = new EmbedBuilder()
			.setTitle(`Píšu si`)
			.setDescription(`Připomenout ${remindText} ${remindAt}`)
			.setColor(0x5865f2);

		const button = new ButtonBuilder()
			.setCustomId(REMINDER_BUTTON_ID_PREFIX + reminder.id)
			.setLabel('Taky chci připomenout :)')
			.setStyle(ButtonStyle.Primary);

		const row = new ActionRowBuilder().addComponents(button);

		await interaction.editReply({
			embeds: [embed],
  			components: [row.toJSON()],
		})
	},
	async onButtonClick(client: Client, interaction: ButtonInteraction){
		if(!interaction.customId.startsWith(REMINDER_BUTTON_ID_PREFIX)) return

		const reminderId = interaction.customId.replace(REMINDER_BUTTON_ID_PREFIX, "");

		const prisma = client.prisma;
		const userInDb = await client.userService.getDbUser(interaction.user);

		const reminderRecipient = await prisma.reminderRecipient.upsert({
			where: {
				reminderId_userId: {
					reminderId: parseInt(reminderId),
					userId: userInDb.id
				}
			},
			create: {
				userId: userInDb.id,
				reminderId: parseInt(reminderId)
			},
			update: {

			}
		})
			
		await interaction.editReply(`Ok připomenu ti to :p`)
	}
};