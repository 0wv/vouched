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

        // if (!stats) {
        //   console.log(`No stats found for ${setting.guildName}`);
        //   return;
        // }

        // fetch all profiles in the guild and sort by vouches descending
        const profiles = await Profiles.find({
          // guildId: setting.guildId,
        }).sort({ vouches: -1 });

        // if (!profiles) {
        //   console.log(`No profiles found for ${setting.guildName}`);
        //   return;
        // }

        //from Vouches collection, get all vouches for each user in the guild and sum them up
        const vouches = await Vouches.aggregate([
          { $match: { guildId: setting.guildId } },
          {
            $group: {
              _id: "$vouchedUser",
              totalVouches: { $sum: 1 },
            },
          },
        ]).sort({ totalVouches: -1 });

        // // check for empty vouches
        // if (!vouches || !vouches.length) {
        //   console.log(`No vouches found for ${setting.guildName}`);
        //   return;
        // }

        let vouchesMap = vouches
          .map((vouch, index) => {
            const profile = profiles.find((el) => el.user.id === vouch._id);

            if (!profile) return;

            return `**\` ${index + 1} \`** ${Emojis.BLANK}**${profile.user.username}** - **${vouch.totalVouches || 0}** Vouches`;
          })
          .join("\n");

        if (vouchesMap === "") {
          vouchesMap = `\n\n**Something seems off :(**\n\n__This guild has no vouches yet__!`;
        }

        const timestamp = Math.floor(Date.now() / 1000);

        const leaderboard = new EmbedMe()
          .setTitle(`${setting.guildName} - Leaderboard`)
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

          .setThumbnail(setting.guildIcon)
          // .setFooter({ text: `powered by Vouched` })
          .setMain();

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
    }, 1800000); // 30 minutes - 1800000
  }
}
