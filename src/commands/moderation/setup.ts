import { stats } from "./../information/stats";
import {
  ApplicationCommandOptionType,
  ChannelType,
  CommandInteraction,
  GuildMember,
  PermissionFlagsBits,
  TextChannel,
} from "discord.js";
import { Discord, Slash, SlashChoice, SlashGroup, SlashOption, Guard } from "discordx";
import { PermissionGuard } from "@discordx/utilities";
import EmbedMe from "../../utils/EmbedMe.js";
import Profiles from "../../models/Profile.js";
import Settings from "../../models/Settings.js";
import Vouches from "../../models/Vouches.js";
import Statistics from "../../models/Statistics.js";
import { Emojis } from "../../utils/Emojis.js";
import { info } from "console";

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

@Discord()
export class Setup {
  @Slash({
    description: "Set's up the bot for you, hassle free",
    name: "setup",
  })
  @Guard(
    PermissionGuard(["Administrator"], {
      content: "You do not have the permission **`ADMINISTRATOR`** ",
      ephemeral: true,
    })
  )
  async setupGuild(interaction: CommandInteraction): Promise<void> {
    if (!interaction.guild) return;

    const settings = await Settings.findOne({ guildId: interaction.guild.id });

    if (settings?.setup === true) {
      await interaction.reply({
        content: `This server has already been setup.`,
        ephemeral: true,
      });

      return;
    }

    //     const welcomeEmbed = new EmbedMe()
    //       .setDescription(
    //         `**Hey**! Welcome to the setup process, I save you time by setting everything important up for you.\n\nGive me a few seconds to get everything ready for you!
    //       \n\nThis progress bar will show you how far along we are!`
    //       )
    //       .setThumbnail("https://i.imgur.com/u1hy4jz.png")
    //       .setColor("#88abf9");

    // const progressBar = new EmbedMe()
    // .setDescription(`${Emojis.SBG1}${Emojis.SBG2}${Emojis.SBG2}${Emojis.SBG2}${Emojis.SBG2}${Emojis.SBG2}${Emojis.SBG2}${Emojis.SBG2}${Emojis.SBG2}${Emojis.SBG3}`)
    //
    //     const infoBoard = await interaction.reply({
    //       embeds: [welcomeEmbed],
    //       ephemeral: false,
    //     });
    //     const bar = await interaction.channel?.send(
    //       `${Emojis.SBG1}${Emojis.SBG2}${Emojis.SBG2}${Emojis.SBG2}${Emojis.SBG2}${Emojis.SBG2}${Emojis.SBG2}${Emojis.SBG2}${Emojis.SBG2}${Emojis.SBG2}${Emojis.SBG3}`
    //     );
    //
    //     await delay(5000);
    //     await bar?.edit(
    //       `${Emojis.SB1}${Emojis.SB2}${Emojis.SB35}${Emojis.SBG2}${Emojis.SBG2}${Emojis.SBG2}${Emojis.SBG2}${Emojis.SBG2}${Emojis.SBG2}${Emojis.SBG2}${Emojis.SBG3}`
    //     );
    //     await delay(1000);

    let everyone = interaction.guild.roles.cache.find(
      (r) => r.name === "@everyone"
    );

    const category = await interaction.guild.channels.create({
      name: "Vouched",
      type: ChannelType.GuildCategory,
      position: 1,
    });

    const leaderboardCh = await category.children.create({
      name: "leaderboard",
      type: ChannelType.GuildText,
      permissionOverwrites: [
        {
          id: everyone?.id!,
          deny: [PermissionFlagsBits.SendMessages],
        },
      ],
    });

    const vouchesCh = await category.children.create({
      name: "vouches",
      type: ChannelType.GuildText,
      permissionOverwrites: [
        {
          id: everyone?.id!,
          deny: [PermissionFlagsBits.SendMessages],
        },
      ],
    });

    if (!settings) {
      await Settings.create({
        guildId: interaction.guild.id,
        guildName: interaction.guild.name,
        guildIcon: interaction.guild.iconURL(),
        "Channels.leaderboard": leaderboardCh.id,
        "Channels.vouches": vouchesCh.id,
      });

      return;
    }

    await Settings.findOneAndUpdate(
      {
        guildId: interaction.guild.id,
      },
      {
        "Channels.leaderboard": leaderboardCh.id,
        "Channels.vouches": vouchesCh.id,
      }
    );

    //     await delay(5000);
    //
    //     await bar?.edit(
    //       `${Emojis.SB1}${Emojis.SB2}${Emojis.SB2}${Emojis.SB2}${Emojis.SB2}${Emojis.SB2}${Emojis.SB35}${Emojis.SBG2}${Emojis.SBG2}${Emojis.SBG2}${Emojis.SBG3}`
    //     );

    await interaction.guild.roles.create({
      name: "client",
      color: "#88abf9",
    });

    //     await delay(5000);
    //
    //     await bar?.edit(
    //       `${Emojis.SB1}${Emojis.SB2}${Emojis.SB2}${Emojis.SB2}${Emojis.SB2}${Emojis.SB2}${Emojis.SB2}${Emojis.SB2}${Emojis.SB35}${Emojis.SBG2}${Emojis.SBG3}`
    //     );

    //     await delay(5000);
    //     await infoBoard.edit({
    //       embeds: [
    //         welcomeEmbed
    //           .setDescription(
    //             `**SETUP COMPLETE**\n\n Everything is now setup and should be in working order, Thanks for your patience :)
    //             \n\nIf you need to add channels **manually**, use the **\` /vouch \`** or **\` /leaderboard \`** commands to set them up.`
    //           )
    //           .setColor("#2EFF5B"),
    //       ],
    //     });
    //     await bar?.edit(
    //       `${Emojis.SB1}${Emojis.SB2}${Emojis.SB2}${Emojis.SB2}${Emojis.SB2}${Emojis.SB2}${Emojis.SB2}${Emojis.SB2}${Emojis.SB2}${Emojis.SB2}${Emojis.SB3}`
    //     );

    //     await delay(2000);
    //     await bar?.delete();

    const stats = await Statistics.findOne({ guildId: interaction.guild.id });

    const profiles = await Profiles.find({}).sort({ vouches: -1 });

    const vouches = await Vouches.aggregate([
      { $match: { guildId: interaction.guild.id } },
      {
        $group: {
          _id: "$vouchedUser",
          totalVouches: { $sum: 1 },
        },
      },
    ]).sort({ totalVouches: -1 });

    let vouchesMap = vouches
      .map((vouch, index) => {
        const profile = profiles.find((el) => el.user.id === vouch._id);

        if (!profile) return;

        return `**\` ${index + 1} \`** ${Emojis.BLANK}**${profile.user.username}** - **${vouch.totalVouches || 0}** Vouches`;
      })
      .join("\n");

    if (vouchesMap === "") {
      vouchesMap = `\n**Something seems off :(**\n\n__This guild has no vouches yet__!`;
    }

    const timestamp = Math.floor(Date.now() / 1000);

    const leaderboard = new EmbedMe()
      .setTitle(`${interaction.guild.name} - Leaderboard`)
      .setDescription(vouchesMap)
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
          value: `${Emojis.BLANK}${stats?.vouches.totalVouches || 0}`,
          inline: true,
        },
        {
          name: "Total Exchanged",
          value: `${Emojis.BLANK} **$**${stats?.vouches.totalAmount.toFixed(2) || 0}`,
          inline: true,
        }
      )

      .setThumbnail(interaction.guild.iconURL())
      // .setFooter({ text: `powered by Vouched` })
      .setMain();

    await leaderboardCh.send({
      embeds: [leaderboard],
    });

    await settings.updateOne({ setup: true });

    const setupComplete = new EmbedMe().setDescription(
      `**SETUP COMPLETE**\n\n Everything is now setup and should be in working order, Thanks for your patience`
    );
  }
}
