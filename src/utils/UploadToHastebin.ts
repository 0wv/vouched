import axios from "axios";
import { TextChannel } from "discord.js";
import { bot } from "../bot.js";
import EmbedMe from "./EmbedMe.js";
import { error } from "console";

export async function hastebin(message: any) {
  const devCord = bot.guilds.cache.get("992229393407672380");

  const channel = devCord?.channels.cache.get(
    "1231931170141245440"
  ) as TextChannel;

  const {
    data: { key }, // extract the key from the response
  } = await axios.post("https://hastebin.com/documents", message, {
    headers: {
      "Content-Type": "text/plain",
      Authorization: `Bearer ${process.env.HASTEBIN_TOKEN}`,
    },
  });

  return { url: `https://hastebin.com/share/${key}`, channel};
}
