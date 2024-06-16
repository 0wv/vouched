import {
  ApplicationCommandOptionType,
  CommandInteraction,
  GuildMember,
  PermissionFlagsBits,
  TextChannel,
} from "discord.js";
import { Discord, Slash, SlashChoice, SlashGroup, SlashOption } from "discordx";
import EmbedMe from "../../utils/EmbedMe.js";
import Profiles from "../../models/Profile.js";
import Settings from "../../models/Settings.js";
import Statistics from "../../models/Statistics.js";
import { Emojis } from "../../utils/Emojis.js";

@Discord()
export class ProfileCommands {
  @Slash({
    description: "view a server's stats",
    name: "serverstats",
  })
  async profile(interaction: CommandInteraction): Promise<void> {
    if (!interaction.guild) return;

    const settings = await Settings.findOne({ guildId: interaction.guild.id });

    if (!settings) {
      await interaction.reply({
        content: `This server does not have settings.`,
        ephemeral: true,
      });

      return;
    }

    const stats = await Statistics.findOne({ guildId: interaction.guild.id });

    if (!stats) {
      await Statistics.create({
        guildId: interaction.guild.id,
        guildName: interaction.guild.name,
        vouches: {
          totalVouches: 0,
          totalAmount: 0,
        },
      });

      await interaction.reply({
        content: `This server does not have stats, so I made them one!`,
        ephemeral: true,
      });

      return;
    }

    const serverStats = new EmbedMe()
      .setTitle("Server Stats")
      .setDescription(
        `__Vouches:__ ${stats.vouches.totalVouches}\n__Exchanged:__ **$**${stats.vouches.totalAmount.toFixed(2)}`
      )
      .setThumbnail(interaction.guild.iconURL())
      .setFooter({ text: `powered by Vouched` })
      .setInfo();

    await interaction.reply({
      embeds: [serverStats],
      ephemeral: true,
    });
  }
}
