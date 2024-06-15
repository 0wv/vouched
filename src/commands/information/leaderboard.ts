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
import Vouches from "../../models/Vouches.js";
import { Emojis } from "../../utils/Emojis.js";

@Discord()
@SlashGroup({
  description: "Leaderboard Commands",
  name: "leaderboard",
})
@SlashGroup("leaderboard")
export class LeaderboardCommands {
  @Slash({
    description: "view global or server leaderboards",
    name: "guild",
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
      await interaction.reply({
        content: `This server does not have statistics :/`,
        ephemeral: true,
      });

      return;
    }

    // fetch all profiles in the guild and sort by vouches descending
    const profiles = await Profiles.find({
      guildId: interaction.guild.id,
    }).sort({ vouches: -1 });

    if (!profiles) {
      await interaction.reply({
        content: `This server does not have any profiles.`,
        ephemeral: true,
      });

      return;
    }

    const vouches = await Vouches.aggregate([
      {
        $group: {
          _id: null,
          totalVouches: { $sum: "$vouches" },
          totalAmount: { $sum: "$amount" },
        },
      },
    ]); // fetch all vouches in the guild, sum them up and return the total vouches and total amount

    // create a leaderboard embed with the top 10 profiles in the guild
    const leaderboard = new EmbedMe()
      .setTitle(`${interaction.guild.name} - Leaderboard`)
      .setDescription(
        profiles
          .slice(0, 10)
          .map(
            (profile, index) =>
              `**\` ${index + 1} \`** ${Emojis.BLANK}**${profile.user.username}** - **${profile.vouches}** Vouches`
          )
          .join("\n")
      )
      .addFields(
        {
          name: " Your Rank",
          value: `${Emojis.BLANK}**\` ${
            profiles.findIndex(
              (profile) => profile.user.id === interaction.user.id
            ) + 1
          } \`**`,
          inline: true,
        },
        {
          name: "Vouches",
          value: `${Emojis.BLANK}${vouches[0].totalVouches}`,
          inline: true,
        },
        {
          name: "Total Exchanged",
          value: `${Emojis.BLANK} **$**${vouches[0].totalAmount.toFixed(2)}`,
          inline: true,
        }
      )

      .setThumbnail(interaction.guild.iconURL())
      .setFooter({ text: `powered by Vouched` })
      .setInvisible();

    await interaction.reply({
      embeds: [leaderboard],
      ephemeral: true,
    });
  }

  @Slash({
    description: "view the global leaderboard",
    name: "global",
  })
  async globalLeaderboard(interaction: CommandInteraction): Promise<void> {
    // fetch all stats in the database and sort by total vouches descending and total amount descending, then slice the top 10
    const stats = await Statistics.find().sort({
      "vouches.totalVouches": -1,
      "vouches.totalAmount": -1,
    });

    if (!stats) {
      await interaction.reply({
        content: `There are no stats to display.`,
        ephemeral: true,
      });

      return;
    }

    // create a leaderboard embed with the top 10 most vouches in

    const leaderboard = new EmbedMe()
      .setTitle(`Global Leaderboard`)
      .setDescription(
        stats
          .slice(0, 10)
          .map(
            (stat, index) =>
              `**\` ${index + 1} \`** ${Emojis.BLANK}**${stat.guildId}** - **${stat.vouches.totalVouches}** Vouches`
          )
          .join("\n")
      )
      .addFields(
        {
          name: "Vouches",
          value: `${Emojis.BLANK}${stats[0].vouches.totalVouches}`,
          inline: true,
        },
        {
          name: "Total Exchanged",
          value: `${Emojis.BLANK} **$**${stats[0].vouches.totalAmount.toFixed(2)}`,
          inline: true,
        }
      )
      .setFooter({ text: `powered by Vouched` })
      .setInvisible();

    await interaction.reply({
      embeds: [leaderboard],
      ephemeral: true,
    });
  }
}
