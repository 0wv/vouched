import {
  ApplicationCommandOptionType,
  CommandInteraction,
  GuildMember,
  PermissionFlagsBits,
  TextChannel,
} from "discord.js";
import {
  Discord,
  Slash,
  SlashChoice,
  SlashGroup,
  SlashOption,
  Guard,
} from "discordx";
import { PermissionGuard } from "@discordx/utilities";
import EmbedMe from "../../utils/EmbedMe.js";
import Profiles from "../../models/Profile.js";
import Settings from "../../models/Settings.js";
import Vouches from "../../models/Vouches.js";
import { Emojis } from "../../utils/Emojis.js";

@Discord()
export class RestoreCommands {
  @Slash({
    description: "restore a guild's vouches.",
    name: "restore",
  })
  @Guard(
    PermissionGuard(["Administrator"], {
      content: "You do not have the permission **`ADMINISTRATOR`** ",
      ephemeral: true,
    })
  )
  async vouchesRestore(interaction: CommandInteraction): Promise<void> {
    const guildId = interaction.guild?.id;
    const guildOwner = interaction.guild?.ownerId;

    if (!guildId) {
      return;
    }

    const vouches = await Vouches.find({
      guildOwnerId: guildOwner,
    });

    if (!vouches) {
      await interaction.reply({
        content: `No vouches found for this guild.`,
        ephemeral: true,
      });

      return;
    }

    const vouchChannel = await Settings.findOne({
      guildId: interaction.guild.id,
      "Channels.vouches": { $exists: true },
    });

    console.log("Vouch Channel: ", vouchChannel);

    if (!vouchChannel) return;

    const channel = interaction.guild.channels.cache.get(
      vouchChannel.Channels.vouches
    ) as TextChannel;

    console.log("Channel: ", channel);

    if (!channel) {
      console.log("Channel not found");
      return;
    }

    const starsList = [
      { name: "⭐", value: "1" },
      { name: "⭐⭐", value: "2" },
      { name: "⭐⭐⭐", value: "3" },
      { name: "⭐⭐⭐⭐", value: "4" },
      { name: "⭐⭐⭐⭐⭐", value: "5" },
    ];

    vouches.forEach(async (vouch) => {
      console.log("Vouch:", vouch);
      const starObject = starsList.find(
        (star) => star.value === vouch.stars.toString()
      );

      const vouchedUser = await interaction.guild?.members.fetch(
        vouch.vouchedUser
      );
      const userAvatar = vouchedUser?.user.displayAvatarURL() as string;

      if (starObject) {
        console.log("Star rating found for vouch:", vouch);
        const stars = parseInt(starObject.value);
        await channel.send({
          embeds: [
            new EmbedMe()
              .setTitle("New Vouch")
              .setURL(channel.url)
              .setInvisible()
              .setThumbnail(userAvatar)
              .setDescription(
                `${Emojis.STAR.repeat(stars) + Emojis.STAROUTLINE.repeat(5 - stars)}`
              )
              .addFields(
                {
                  name: "Vouched User",
                  value: `<@${vouch.vouchedUser}>`,
                  inline: true,
                },
                {
                  name: "Vouched By",
                  value: `<@${vouch.vouchedBy}>`,
                  inline: true,
                },
                {
                  name: "Amount",
                  value: "**$**" + vouch.amount,
                  inline: true,
                },
                {
                  name: "Note",
                  value: "*" + vouch.note + "*",
                }
              ),
          ],
        });
      } else {
        console.error("Star rating not found for vouch:", vouch);
      }
    });

    const restored = new EmbedMe()
      .setDescription(
        `${Emojis.CHECKMARK}${Emojis.BLANK}Guild vouches restored successfully`
      )
      .setSuccess();

    await interaction.reply({
      embeds: [restored],
      ephemeral: true,
    });
  }
}
