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
import Vouches from "../../models/Vouches.js";
import { Emojis } from "../../utils/Emojis.js";
import Statistics from "../../models/Statistics.js";

@Discord()
@SlashGroup({
  description: "Vouch Commands",
  name: "vouch",
})
@SlashGroup("vouch")
export class LevelRoleCommands {
  @Slash({
    description: "add a vouch for a user",
    name: "add",
  })
  async levelrole(
    @SlashOption({
      description: "the user you wish to vouch for.",
      name: "user",
      type: ApplicationCommandOptionType.Mentionable,
      required: true,
    })
    userVar: GuildMember,
    @SlashOption({
      description: "the amount of the transaction - e.g. 5 or 11.59",
      name: "amount",
      type: ApplicationCommandOptionType.String,
      required: true,
    })
    amountVar: string,
    @SlashOption({
      description: "a note about the transaction.",
      name: "note",
      type: ApplicationCommandOptionType.String,
      required: true,
    })
    noteVar: string,
    @SlashChoice(
      { name: "⭐", value: "1" },
      { name: "⭐⭐", value: "2" },
      { name: "⭐⭐⭐", value: "3" },
      { name: "⭐⭐⭐⭐", value: "4" },
      { name: "⭐⭐⭐⭐⭐", value: "5" }
    )
    @SlashOption({
      description: "the amount of stars you wish to give them.",
      name: "stars",
      type: ApplicationCommandOptionType.String,
      required: true,
    })
    starsVar: string,
    interaction: CommandInteraction
  ): Promise<void> {
    if (!interaction.guild) return;

    const stars = parseInt(starsVar);

    // check if the user has a profile, if not create one
    const profile = await Profiles.findOne({ "user.id": userVar.id });

    if (!profile) {
      await Profiles.create({
        guildId: interaction.guild.id,
        user: {
          id: userVar.id,
          username: userVar.user.username,
          nickname: userVar.nickname,
        },
        vouches: 1,
      });
    }

    if (interaction.user.id === userVar.id) {
      await interaction.reply({
        content: "You cannot vouch for yourself.",
        ephemeral: true,
      });
      return;
    }

    await Vouches.create({
      guildId: interaction.guild.id,
      vouchedUser: userVar.id,
      vouchedBy: interaction.user.id,
      stars: starsVar,
      note: noteVar,
      amount: amountVar,
    });

    await Profiles.updateOne(
      { "user.id": userVar.id },
      { $inc: { vouches: 1 } }
    );

    const vouched = new EmbedMe()
      .setDescription(
        `${Emojis.CHECKMARK}${Emojis.BLANK}You have vouched for ${userVar} with **${starsVar}** stars.`
      )
      .setSuccess();

    await interaction.reply({
      embeds: [vouched],
      ephemeral: true,
    });

    const vouchChannel = await Settings.findOne({
      guildId: interaction.guild.id,
      "Channels.vouches": { $exists: true },
    });

    if (!vouchChannel) return;

    const channel = interaction.guild.channels.cache.get(
      vouchChannel.Channels.vouches
    ) as TextChannel;

    if (!channel) return;

    const vouchEmbed = new EmbedMe()
      .setTitle("New Vouch")
      .setURL(channel.url)
      .setThumbnail(userVar.user.displayAvatarURL())
      .setDescription(
        `${Emojis.STAR.repeat(stars) + Emojis.STAROUTLINE.repeat(5 - stars)}`
      )
      .addFields(
        {
          name: "Vouched User",
          value: `<@${userVar.user.id}>`,
          inline: true,
        },
        {
          name: "Vouched By",
          value: `<@${interaction.user.id}>`,
          inline: true,
        },
        {
          name: "Amount",
          value: "**$**" + amountVar,
          inline: true,
        },
        {
          name: "Note",
          value: "*" + noteVar + "*",
        }
      )
      .setFooter({ text: `powered by Vouched` })
      .setSuccess();

    await channel.send({
      embeds: [vouchEmbed],
    });

    const stats = await Statistics.findOne({ guildId: interaction.guild.id });

    if (!stats) {
      await Statistics.create({
        guildId: interaction.guild.id,
        vouches: {
          totalVouches: 1,
        },
      });
    } else {
      await Statistics.updateOne(
        { guildId: interaction.guild.id },
        {
          $inc: {
            "vouches.totalVouches": 1,
            "vouches.totalAmount": Number(amountVar),
          },
        }
      );
    }

    const vouchDm = new EmbedMe()
      .setTitle(`You've been vouched in ${interaction.guild.name}`)
      .setURL(channel.url)
      .setThumbnail(interaction.guild.iconURL())
      .setDescription(
        `${Emojis.STAR.repeat(stars) + Emojis.STAROUTLINE.repeat(5 - stars)}`
      )
      .addFields(
        {
          name: "Vouched By",
          value: `<@${interaction.user.id}>`,
          inline: true,
        },
        {
          name: "Amount",
          value: "**$**" + amountVar,
          inline: true,
        },
        {
          name: "Note",
          value: "*" + noteVar + "*",
        }
      )
      .setFooter({ text: `powered by Vouched` })
      .setSuccess();

    await userVar.send({
      embeds: [vouchDm],
    });
  }

  @Slash({
    description: "set the channel to display vouches",
    name: "channel",
  })
  async channel(
    @SlashOption({
      description: "the channel you wish to display vouches in.",
      name: "channel",
      type: ApplicationCommandOptionType.Channel,
      required: true,
    })
    channelVar: TextChannel,
    interaction: CommandInteraction
  ): Promise<void> {
    if (!interaction.guild) return;
    const member = interaction.member as GuildMember;

    if (!member?.permissions.has(PermissionFlagsBits.Administrator)) {
      await interaction.reply({
        content:
          "You do not have the required permissions to run this command!",
        ephemeral: true,
      });
    }

    const settings = await Settings.findOne({ guildId: interaction.guild.id });

    if (!settings) {
      await Settings.create({
        guildId: interaction.guild.id,
        "Channels.vouches": channelVar.id,
      });
    } else {
      await Settings.findOneAndUpdate(
        { guildId: interaction.guild.id },
        { "Channels.vouches": channelVar.id }
      );
    }

    const success = new EmbedMe()
      .setTitle("Successfully Set Channel")
      .setDescription(
        `${Emojis.CHECKMARK}${Emojis.BLANK}You have set the vouch channel to ${channelVar}.`
      )
      .setSuccess();

    await interaction.reply({
      embeds: [success],
      ephemeral: true,
    });
  }
}
