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
export class ProfileCommands {
  @Slash({
    description: "view a user's profile",
    name: "profile",
  })
  async profile(
    @SlashOption({
      description: "the user you wish to see the profile of.",
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
      await Profiles.create({
        guildId: interaction.guild.id,
        user: {
          id: userVar.id,
          username: userVar.user.username,
          nickname: userVar.nickname,
        },
        vouches: 0,
      });

      await interaction.reply({
        content: `${userVar} does not have a profile, so I made them one!`,
        ephemeral: true,
      });

      return;
    }

    //fetch user's vouches
    const vouches = await Vouches.aggregate([
      { $match: { vouchedUser: userVar.id } },
      {
        $group: {
          _id: "$vouchedUser",
          averageStars: { $avg: "$stars" },
          totalAmount: { $sum: "$amount" },
        },
      },
      {
        $lookup: {
          from: "vouches",
          let: { vouchedUser: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$vouchedUser", "$$vouchedUser"] } } },
            { $sort: { timestamp: -1 } },
            { $limit: 3 },
          ],
          as: "lastVouches",
        },
      },
    ]);

    const averageStars = vouches[0]?.averageStars || 0;

    // console.log(vouches[0].lastVouches);

    let lastVouchesString = "";

    vouches[0].lastVouches.forEach((vouch: any, index: number) => {
      lastVouchesString += `${index + 1}. <@${vouch.vouchedBy}> - ${Emojis.STAR.repeat(vouch.stars) + Emojis.STAROUTLINE.repeat(5 - vouch.stars)}\n`;
    });

    const totalAmount = vouches[0]?.totalAmount || 0;

    const profileEmbed = new EmbedMe()
      .setTitle(`${userVar.user.displayName}'s Profile`)
      .setThumbnail(userVar.user.displayAvatarURL())
      .setDescription(
        `**Vouches:** ${profile.vouches}\n**total amount:** **\` $${totalAmount} \`**\n**Average Stars:** ${parseInt(
          averageStars.toFixed(2)
        )}/5`
      )
      .addFields({
        name: "Last 3 Vouches",
        value: lastVouchesString || "*No vouches yet :(*",
      })
      .setFooter({ text: `powered by Vouched` });

    await interaction.reply({ embeds: [profileEmbed], ephemeral: true });
  }
}
