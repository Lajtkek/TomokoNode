import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  ButtonBuilder,
  SlashCommandBuilder,
  ButtonStyle,
  ActionRowBuilder,
  type ButtonInteraction,
  Client,
} from "discord.js";

const REMINDER_BUTTON_ID_PREFIX = "remind-me_";
import { Cron } from "croner";
import { formatDuration, intervalToDuration, isValid, parse } from "date-fns";
import { type Reminder } from "../../generated/prisma/index.js";

function parseCz(s: string): Date | null {
  const patterns = ["dd.MM.yyyy HH:mm", "dd.MM.yyyy H:mm", "dd.MM.yyyy"];

  for (const p of patterns) {
    const d = parse(s, p, new Date());
    if (isValid(d)) return d;
  }
  return null;
}

function formatMs(ms: number): string {
  return formatDuration(intervalToDuration({ start: 0, end: ms }), {
    format: ["years", "months", "days", "hours", "minutes", "seconds"],
  });
}

function createCron(client: Client, reminder: Reminder) {
  const remindAtDate = reminder.remindAt;

  const cron = new Cron(remindAtDate, async () => {
    const channel = await client.channels.fetch(reminder.idChannel);

    if (!channel?.isSendable()) return;

    channel.send({
		content: `Halooo halooo, přípomínám "${reminder.description}"`,
		allowedMentions: {
			parse: []
		}
	});

    const usersToPing = await client.prisma.reminderRecipient.findMany({
      where: {
        reminderId: reminder.id,
      },
    });

    channel.send("" + usersToPing.map((x) => `<@${x.userId}>`).join(","));
  });

  console.log(
    `Created cron "${reminder.description}" in ${formatMs(cron.msToNext() ?? 0)}`,
  );
  return cron;
}

export default {
  async init(client: Client) {
    const prisma = client.prisma;

    const reminders = await prisma.reminder.findMany({
      where: {
        remindAt: {
          gt: new Date(),
        },
      },
    });

    for (const reminder of reminders) {
      await createCron(client, reminder);
    }
  },
  data: new SlashCommandBuilder()
    .setName("remind-me")
    .addStringOption((option) =>
      option
        .setName("remind-at")
        .setDescription("When should I remind you? (e.g. 5.10.2000 8:00)")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("remind-text")
        .setDescription("What should I remind you about?")
        .setRequired(true),
    )
    .setDescription("Creates event that reminds user"),
  async execute(interaction: ChatInputCommandInteraction) {
    const remindAt = interaction.options.getString("remind-at", true);
    const remindText = interaction.options.getString("remind-text", true);

    const remindAtDate = parseCz(remindAt);

    await interaction.deferReply();
    if (remindAtDate == null) {
      await interaction.editReply(`Nevím co myslíš tím "${remindAt}"`);
      return;
    }

    if (remindAtDate < new Date()) {
      await interaction.editReply(`Minulost`);
      return;
    }

    const client = interaction.client;
    const prisma = client.prisma;
    const userInDb = await client.userService.getDbUser(interaction.user);

    const reminder = await prisma.reminder.create({
      data: {
        idOwner: userInDb.id,
        recipients: {
          create: [
            {
              userId: userInDb.id,
            },
          ],
        },
        description: remindText,
        remindAt: remindAtDate,
        idChannel: interaction.channelId,
      },
    });

    const cron = await createCron(client, reminder);
    const toNext = cron.msToNext();

    if (toNext == null) {
      await interaction.editReply(`To už přoběhlo kamaráde :D`);
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`Píšu si`)
      .setDescription(
        `Připomenout ${remindText} ${remindAt} (za ${formatMs(toNext)})`,
      )
      .setColor(0x5865f2);

    const button = new ButtonBuilder()
      .setCustomId(REMINDER_BUTTON_ID_PREFIX + reminder.id)
      .setLabel("Taky chci připomenout :)")
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(button);

    await interaction.editReply({
      embeds: [embed],
      components: [row.toJSON()],
    });
  },
  async onButtonClick(client: Client, interaction: ButtonInteraction) {
    if (!interaction.customId.startsWith(REMINDER_BUTTON_ID_PREFIX)) return;

    interaction.deferReply();

    const reminderId = parseInt(
      interaction.customId.replace(REMINDER_BUTTON_ID_PREFIX, ""),
    );

    const prisma = client.prisma;
    const userInDb = await client.userService.getDbUser(interaction.user);

    const reminder = await prisma.reminder.findFirst({
      where: {
        id: reminderId,
      },
    });

    if (reminder == null) {
      await interaction.editReply(`Reminder nenalezen`);
      return;
    }

    if (reminder.remindAt <= new Date()) {
      await interaction.editReply(`To už se stalo xd`);
      return;
    }

    const reminderRecipient = await prisma.reminderRecipient.upsert({
      where: {
        reminderId_userId: {
          reminderId: reminderId,
          userId: userInDb.id,
        },
      },
      create: {
        userId: userInDb.id,
        reminderId: reminderId,
      },
      update: {},
    });

    await interaction.reply({
      content: `Ok připomenu ti to :p`,
      flags: ["Ephemeral"]
    });
  },
};
