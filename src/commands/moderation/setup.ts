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

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

@Discord()
export class Setup {
  @Slash({
    description: "Set's up the bot for you, hassle free",
    name: "setup",
  })
  async setupGuild(interaction: CommandInteraction): Promise<void> {
    if (!interaction.guild) return;

    const welcomeEmbed = new EmbedMe()
    .setDescription(
      `**Hey**! Welcome to the setup process, I save you time by setting everything important up for you.\n\nI'll show you what i'm doing, **as i'm dong it**, so relax while I get things ready for you
      \n\nThis progress bar will show you how far along we are!`
    )
    .setThumbnail("https://i.imgur.com/u1hy4jz.png")
    .setColor("#88abf9");
    
    // const progressBar = new EmbedMe()
    // .setDescription(`${Emojis.SBG1}${Emojis.SBG2}${Emojis.SBG2}${Emojis.SBG2}${Emojis.SBG2}${Emojis.SBG2}${Emojis.SBG2}${Emojis.SBG2}${Emojis.SBG2}${Emojis.SBG3}`)
    
    await interaction.reply({ embeds: [welcomeEmbed], ephemeral: false });
    
    const bar = await interaction.channel?.send(`${Emojis.SB4}${Emojis.SBG2}${Emojis.SBG2}${Emojis.SBG2}${Emojis.SBG2}${Emojis.SBG2}${Emojis.SBG2}${Emojis.SBG2}${Emojis.SBG2}${Emojis.SBG2}${Emojis.SBG3}`);
    delay(60000);
    await bar?.edit(`${Emojis.SB1}${Emojis.SB35}${Emojis.SBG2}${Emojis.SBG2}${Emojis.SBG2}${Emojis.SBG2}${Emojis.SBG2}${Emojis.SBG2}${Emojis.SBG2}${Emojis.SBG2}${Emojis.SBG3}`)
    delay(60000);
    await bar?.edit(`${Emojis.SB1}${Emojis.SB2}${Emojis.SB35}${Emojis.SBG2}${Emojis.SBG2}${Emojis.SBG2}${Emojis.SBG2}${Emojis.SBG2}${Emojis.SBG2}${Emojis.SBG2}${Emojis.SBG3}`)


  }
}
