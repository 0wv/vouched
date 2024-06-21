import { Discord, On, ArgsOf, Client } from "discordx";
import Profiles from "../models/Profile.js";
import { GuildMember, TextChannel } from "discord.js";
import EmbedMe from "../utils/EmbedMe.js";
import Profile from "../models/Profile.js";

@Discord()
export class MemberJoin {
  @On()
  async guildMemberAdd([member]: ArgsOf<"guildMemberAdd">) {

    if(member.user.bot) return;

    const profile = await Profile.findOne({ userID: member.id });
    if (profile) return;

    await Profile.create({
      guildId: member.guild.id,
      user: {
        id: member.id,
        username: member.user.username,
        nickname: member.nickname,
      },
      vouches: 0,
    });
  }
}
