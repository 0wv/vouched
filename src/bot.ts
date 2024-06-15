import {
  Interaction,
  Message,
  TextChannel,
  GatewayIntentBits,
  Client as DiscordClient,
  Partials,
} from "discord.js";
import { IntentsBitField, ActivityType } from "discord.js";
import { Client } from "discordx";
import { hastebin } from "./utils/UploadToHastebin.js";
import EmbedMe from "./utils/EmbedMe.js";

export const bot = new Client({
  // To use only guild command
  // botGuilds: [(client) => client.guilds.cache.map((guild) => guild.id)],

  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.GuildMessageReactions,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildVoiceStates,
    IntentsBitField.Flags.GuildPresences,
    IntentsBitField.Flags.GuildMessageTyping,
    IntentsBitField.Flags.DirectMessages,
    IntentsBitField.Flags.DirectMessageReactions,
    IntentsBitField.Flags.DirectMessageTyping,
    IntentsBitField.Flags.MessageContent,
  ],

  partials: [Partials.GuildMember, Partials.Message, Partials.Reaction, Partials.User],

  // Debug logs are disabled in silent mode
  silent: true,
}) as Client

// async function updatePresence() {
//   bot.user?.setPresence({
//     activities: [
//       {
//         type: ActivityType.Custom,
//         name: "custom", // name is exposed through the API but not shown in the client for ActivityType.Custom
//         state: `.gg/glock`,
//       },
//     ],
//     status: "dnd",
//   });
// }

bot.once("ready", async () => {
  await bot.guilds.fetch();

  // Synchronize applications commands with Discord
  await bot.initApplicationCommands();

  // updatePresence();
  // setInterval(updatePresence, 300000);


  // To clear all guild commands, uncomment this line,
  // This is useful when moving from guild commands to global commands
  // It must only be executed once
  //
  //  await bot.clearApplicationCommands(
  //    ...bot.guilds.cache.map((g) => g.id)
  //  );

  console.log("\u001b[36m+" + "\u001b[37m logged in as " + bot.user?.tag);
});

bot.on("interactionCreate", async (interaction: Interaction) => {
  try {
    bot.executeInteraction(interaction);
  } catch (error: any) {
    console.error(error);
    const devCord = bot.guilds.cache.get("1251284356182310942");

    const channel = devCord?.channels.cache.get(
      "1251331189952872458"
    ) as TextChannel;
    const hastebinUrl = await hastebin(error.stack);

    const errorEmbed = new EmbedMe()
      .setTitle("Error")
      .setDescription(
        `An error occurred while executing a command. [View error](${hastebinUrl})`
      )
      .setInvisible();

    await channel?.send({
      content: "<@828701236911144971>",
      embeds: [errorEmbed],
    });
  }
});

bot.on("messageCreate", async (message: Message) => {
  await bot.executeCommand(message);
});
