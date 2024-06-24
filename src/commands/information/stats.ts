import {
  ApplicationCommandOptionType,
  AttachmentBuilder,
  CommandInteraction,
  GuildMember,
  PermissionFlagsBits,
  TextChannel,
} from "discord.js";
import { Discord, Slash, SlashChoice, SlashGroup, SlashOption } from "discordx";
import moment from "moment";
import { ChartJSNodeCanvas } from "chartjs-node-canvas";
import EmbedMe from "../../utils/EmbedMe.js";
import Profiles from "../../models/Profile.js";
import Settings from "../../models/Settings.js";
import Statistics from "../../models/Statistics.js";
import Vouches from "../../models/Vouches.js";
import { getChartData } from "../../utils/statistics.js";
import { Emojis } from "../../utils/Emojis.js";

const canvas = new ChartJSNodeCanvas({ width: 800, height: 400 });

@Discord()
export class stats {
  @Slash({
    description: "display the guilds stats.",
    name: "stats",
  })
  async statsGuild(
    @SlashChoice("7d", "14d", "30d")
    @SlashOption({
      name: "time",
      description: "The time period to display verifications for.",
      type: ApplicationCommandOptionType.String,
      required: true,
    })
    time: string,
    interaction: CommandInteraction
  ): Promise<void> {
    if (!interaction.guild) return;

    //fetch the guild statistics from the Statistics model, and store them as labels, and data.
    const vouches = await Vouches.find({ guildId: interaction.guild.id });

    console.log(vouches)

    if (!vouches) {
      console.log('No vouches found for this guild.');
      return;
    }

    //using chart.renderToBuffer to render the chart to a buffer. using vouches as the labels and data, type being line. Use vouches collection to get the vouches for the past 7 days.
    const chart = await canvas.renderToBuffer({
      type: "line",
      data: {
        labels: vouches.map((vouch) => moment(vouch.createdAt).format("MM-DD")),
        datasets: [
          {
            label: "Vouches",
            data: vouches.map((vouch) => vouch.amount),
            fill: false,
            borderColor: "#FFFFFF",
          },
        ],
      },
      options: {
        scales: {
          x: {
            ticks: {
              color: "#FFFFFF",
            },
          },
          y: {
            ticks: {
              color: "#FFFFFF",
            },
          },
        },
      },
    });

    const embed = new EmbedMe()
      .setTitle(`${interaction.guild.name} - The past ${time}.`)
      .setImage("attachment://chart.png")
      .setMain()
      .setFooter({ text: "Vouches" });

    interaction.reply({
      embeds: [embed],
      files: [new AttachmentBuilder(chart, { name: "chart.png" })],
    });
  }
}
