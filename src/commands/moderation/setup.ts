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

@Discord()
export class Setup {
  @Slash({
    description: "Set's up the bot for you, hassle free",
    name: "setup",
  })
  async setupGuild(interaction: CommandInteraction): Promise<void> {
    if (!interaction.guild) return;

    
  }
}
