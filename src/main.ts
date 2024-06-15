import { dirname, importx } from "@discordx/importer";

import { bot } from "../src/bot.js";
import { config } from "dotenv";
import colors from "colors";
import { connect } from "mongoose";

config();

async function run() {
  // The following syntax should be used in the commonjs environment
  //
  // await importx(__dirname + "/{events,commands}/**/*.{ts,js}");

  // The following syntax should be used in the ECMAScript environment
  await importx(`${dirname(import.meta.url)}/{events,commands}/**/*.{ts,js}`);

  // Let's start the bot
  if (!process.env.BOT_TOKEN) {
    throw Error("Could not find BOT_TOKEN in your environment");
  }

  // Log in with your bot token
  await bot.login(process.env.BOT_TOKEN);

  // Connect to MongoDB
  if (!process.env.MONGO_SRV) {
    throw Error("Could not find MONGODB_SRV in your environment");
  }
}

connect(process.env.MONGO_SRV as string).then(() => {
  console.log("\u001b[36m+" + "\u001b[37m Connected to database");
  run()
})
