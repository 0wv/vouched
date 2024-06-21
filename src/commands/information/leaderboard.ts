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
      { $match: { guildId: interaction.guild.id } },
      {
        $group: {
          _id: "$vouchedUser",
          totalVouches: { $sum: 1 },
        },
      },
    ]).sort({ totalVouches: -1 });

    // check for empty vouches
    if (!vouches || !vouches.length) {
      console.log(`No vouches found for ${interaction.guild.name}`);
      return;
    }

    //console log the user with their vouches

    const timestamp = Math.floor(Date.now() / 1000);

    const leaderboard = new EmbedMe()
      .setTitle(`${interaction.guild.name} - Leaderboard`)
      .setDescription(
        vouches
          .map((vouch, index) => {
            const profile = profiles.find((el) => el.user.id === vouch._id);

            if (!profile) return;

            return `**\` ${index + 1} \`** ${Emojis.BLANK}**${profile.user.username}** - **${vouch.totalVouches || 0}** Vouches`;
          })
          .join("\n")
      )
      .addFields(
        {
          name: "\u200b",
          value: `\u200b`,
        },
        {
          name: "Last Updated",
          value: `<t:${timestamp}:R>`,
          inline: true,
        },
        {
          name: "Vouches",
          value: `${Emojis.BLANK}${stats.vouches.totalVouches || 0}`,
          inline: true,
        },
        {
          name: "Total Exchanged",
          value: `${Emojis.BLANK} **$**${stats.vouches.totalAmount.toFixed(2) || 0}`,
          inline: true,
        }
      )

      .setThumbnail(interaction.guild.iconURL())
      // .setFooter({ text: `powered by Vouched` })
      .setMain();

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
    if (!interaction.guild) return;
    // fetch all profiles in the guild and sort by vouches descending
    const profiles = await Profiles.find().sort({ vouches: -1 }).limit(10);

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
          totalVouches: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
        },
      } as any,
    ]);

    //fetch the guilds and sort them by vouches using statistics model to get the top 10 guilds with the most vouches
    const guilds = await Statistics.find().sort({ "vouches.totalVouches": -1 });

    const leaderboard = new EmbedMe()
      .setTitle(`Global Leaderboard`)
      .setDescription(
        guilds
            .slice(0, 10)
            .map(
                (guild, index) => {
                    let medal = '';
                    if (index === 0) medal = ' 🥇';
                    else if (index === 1) medal = ' 🥈';
                    else if (index === 2) medal = ' 🥉';
    
                    return `**\` ${index + 1} \`** ${Emojis.BLANK}**${guild.guildName}** - **${guild.vouches.totalVouches}** Vouches ${medal}`;
                }
            )
            .join("\n")
    )
      // .setThumbnail(interaction.guild.iconURL())
      .addFields(
        {
          name: "\u200b",
          value: `\u200b`,
        },
        {
          name: "Guild Rank",
          value: `${Emojis.BLANK}**\` ${guilds.findIndex((el) => el.guildId === interaction.guild?.id) + 1} \`**`,
          inline: true,
        },
        {
          name: "Global Vouches",
          value: `${Emojis.BLANK} **\` ${vouches[0].totalVouches} \`**`,
          inline: true,
        },
        {
          name: "Globally Exchanged",
          value: `${Emojis.BLANK} **$**${vouches[0].totalAmount.toFixed(2)}`,
          inline: true,
        }
      )
      // .setFooter({ text: `powered by Vouched` })
      .setMain();

    await interaction.reply({
      embeds: [leaderboard],
      ephemeral: true,
    });
  }

  @Slash({
    description: "set a channel for the leaderboard to be posted in",
    name: "channel",
  })
  async channel(
    @SlashOption({
      description: "the channel you want the leaderboard to be posted in",
      name: "channel",
      type: ApplicationCommandOptionType.Channel,
      required: true,
    })
    channel: TextChannel,
    @SlashChoice("on", "off")
    @SlashOption({
      description: "whether to toggle the leaderboard on or off",
      name: "toggle",
      type: ApplicationCommandOptionType.Boolean,
      required: false,
    })
    toggle: boolean,
    interaction: CommandInteraction
  ): Promise<void> {
    if (!interaction.guild) return;

    if (toggle === false) {
      await Settings.findOneAndUpdate(
        { guildId: interaction.guild.id },
        { "Channels.leaderboard": null }
      );

      await interaction.reply({
        content: `Leaderboard channel has been disabled.`,
        ephemeral: true,
      });

      return;
    }

    const member = interaction.member as GuildMember;

    if (!member?.permissions.has(PermissionFlagsBits.Administrator)) {
      await interaction.reply({
        content: `You do not have permission to use this command.`,
        ephemeral: true,
      });

      return;
    }

    const settings = await Settings.findOne({ guildId: interaction.guild.id });

    if (!settings) {
      await Settings.create({
        guildId: interaction.guild.id,
        "Channels.leaderboard": channel.id,
      });

      await interaction.reply({
        content: `Leaderboard channel has been set to ${channel}`,
        ephemeral: true,
      });

      return;
    }

    const profiles = await Profiles.find({
      guildId: interaction.guild.id,
    }).sort({ vouches: -1 }); // []

    if (!profiles || !profiles.length) {
      await interaction.reply({
        content: `This server does not have any profiles.`,
        ephemeral: true,
      });

      return;
    }

    await Settings.findOneAndUpdate(
      {
        guildId: interaction.guild.id,
      },
      { "Channels.leaderboard": channel.id }
    );

    await interaction.reply({
      content: `Leaderboard channel has been updated to ${channel}`,
      ephemeral: true,
    });

    const vouches = await Vouches.aggregate([
      {
        $match: {
          guildId: interaction.guild.id,
        },
      },
      {
        $group: {
          _id: null,
          totalVouches: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
        },
      },
    ]); // fetch all vouches in the guild, sum them up and return the total vouches and total amount

    let totalVouches = 0;
    let totalAmount = 0;

    if (vouches[0]) {
      totalVouches = vouches[0].totalVouches;
      totalAmount = vouches[0].totalAmount;
    } else {
      console.log("No vouches found.");
    }
    //generate The Current Epoch Unix Timestamp of the current time
    const timestamp = Math.floor(Date.now() / 1000);

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
          name: "\u200b",
          value: `\u200b`,
        },
        {
          name: "Last Updated",
          value: `<t:${timestamp}:R>`,
          inline: true,
        },
        {
          name: "Vouches",
          value: `${Emojis.BLANK}${totalVouches || 0}`,
          inline: true,
        },
        {
          name: "Total Exchanged",
          value: `${Emojis.BLANK} **$**${totalAmount.toFixed(2) || 0}`,
          inline: true,
        }
      )

      .setThumbnail(interaction.guild.iconURL())
      // .setFooter({ text: `powered by Vouched` })
      .setMain();

    const sentMessage = await channel.send({
      embeds: [leaderboard],
    });

    //fetch message id of leaderboard embed
    const embedId = sentMessage.id;
    console.log(embedId);
  }
}
