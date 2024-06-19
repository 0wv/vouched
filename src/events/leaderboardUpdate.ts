import { bot } from "./../bot";
import { Discord, On, ArgsOf, Client } from "discordx";
import Profiles from "../models/Profile.js";
import { GuildMember, TextChannel } from "discord.js";
import EmbedMe from "../utils/EmbedMe.js";
import Settings from "../models/Settings.js";
import Statistics from "../models/Statistics.js";
import Vouches from "../models/Vouches.js";
import { Emojis } from "../utils/Emojis.js";
import { profile } from "console";

@Discord()
export class leaderboardUpdate {
  @On()
  async ready([bot]: ArgsOf<"ready">) {
    setInterval(async () => {
      const settings = await Settings.find({
        guildId: bot.guilds.cache.map((guild) => guild.id),
      });

      if (!settings) return;

      settings.forEach(async (setting) => {
        const stats = await Statistics.findOne({ guildId: setting.guildId });

        if (!stats) {
          return;
        }

        // fetch all profiles in the guild and sort by vouches descending
        const profiles = await Profiles.find({
          guildId: setting.guildId,
        }).sort({ vouches: -1 });

        if (!profiles) {
          return;
        }

        const vouches = await Vouches.aggregate([
          {
            $match: { guildId: setting.guildId },
          },
          {
            $group: {
              _id: null,
              totalVouches: { $sum: "$vouches" },
              totalAmount: { $sum: "$amount" },
            },
          },
        ]);

        let totalVouches = 0;
        let totalAmount = 0;

        if (vouches[0]) {
          totalVouches = vouches[0].totalVouches;
          totalAmount = vouches[0].totalAmount;
        } else {
          console.log("No vouches found.");
        }

        const timestamp = Math.floor(Date.now() / 1000);

        // create a leaderboard embed with the top 10 profiles in the guild
        const leaderboard = new EmbedMe()
          .setTitle(`${setting.guildName} - Leaderboard`)
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

          .setThumbnail(setting.guildIcon)
          .setFooter({ text: `powered by Vouched` })
          .setInvisible();

        const channel = bot.channels.cache.get(
          setting.Channels.leaderboard
        ) as TextChannel;

        if (!channel) {
          console.log(
            `Channel with ID ${setting.Channels.leaderboard} not found.`
          );
          return;
        }

        const botId = bot.user.id;

        const messages = await channel.messages.fetch({ limit: 100 }); // fetch the last 100 messages

        const botMessages = messages.filter(
          (message) => message.author.id === botId
        );

        await Promise.all(
          botMessages.map(async (message) => {
            await message.delete();
          })
        );

        await channel.send({
          embeds: [leaderboard],
        });
      });
    }, 10000);
  }
}
