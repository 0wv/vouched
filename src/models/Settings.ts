import mongoose, { PopulatedDoc, Schema } from "mongoose";

export interface ISettings extends Document {
  guildId: string;
  guildName: string;
  guildIcon: string;
  Channels: {
    vouches: string;
    leaderboard: string;
  };
}

const SettingsSchema: Schema = new Schema(
  {
    guildId: { type: String, required: true },
    guildName: { type: String, required: true },
    guildIcon: { type: String, required: true },
    Channels: {
      vouches: { type: String, required: false },
      leaderboard: { type: String, required: false },
    },
  },
  { timestamps: true }
);

export default mongoose.model<ISettings>("Settings", SettingsSchema);
