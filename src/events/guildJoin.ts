import { Discord, On, ArgsOf, Client } from "discordx";
import Profiles from "../models/Profile.js";
import { GuildMember, TextChannel } from "discord.js";
import EmbedMe from "../utils/EmbedMe.js";
import Settings from "../models/Settings.js";
import Statistics from "../models/Statistics.js";

@Discord()
export class MemberJoin {
  @On()
  async guildCreate([guild]: ArgsOf<"guildCreate">) {
    const settings = await Settings.findOne({ guildId: guild.id });

    if (settings) return;

    await Settings.create({
      guildId: guild.id,
      Channels: {
        vouches: null,
      },
    });

    console.log(
      "\u001b[33m+" + "\u001b[37m Created settings for " + guild.name
    );

    await Statistics.create({
      guildId: guild.id,
      guildName: guild.name,
      vouches: {
        totalVouches: 0,
        totalAmount: 0,
      },
    });

    console.log(
      "\u001b[33m+" + "\u001b[37m Created statistics for " + guild.name
    );
  }
}
