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
@SlashGroup({
  description: "Reset Commands",
  name: "reset",
})
@SlashGroup("reset")
export class ResetCommands {
  @Slash({
    description: "reset a user's profile",
    name: "profile",
  })
  @Guard(
    PermissionGuard(["Administrator"], {
      content: "You do not have the permission **`ADMINISTRATOR`** ",
      ephemeral: true,
    })
  )
  async resetProfile(
    @SlashOption({
      description: "the user you wish to reset the profile of.",
      name: "user",
      type: ApplicationCommandOptionType.Mentionable,
      required: true,
    })
    userVar: GuildMember,
    interaction: CommandInteraction
  ): Promise<void> {
    if (!interaction.guild) return;
    if (interaction.user.bot) return;

    // check if the user has a profile, if not create one
    const profile = await Profiles.findOne({
      guildId: interaction.guild.id,
      "user.id": userVar.id,
    });

    if (!profile) {
      await interaction.reply({
        content: `${userVar} does not have a profile.`,
        ephemeral: true,
      });

      return;
    }

    await Profiles.deleteOne({ "user.id": userVar.id });

    await Profiles.create({
      guildId: interaction.guild.id,
      user: {
        id: userVar.id,
        username: userVar.user.username,
        nickname: userVar.nickname,
      },
      vouches: 0,
      totalAmount: 0,
    });

    await interaction.reply({
      content: `Reset ${userVar}'s profile.`,
      ephemeral: true,
    });
  }
}
