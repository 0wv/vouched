import mongoose, { PopulatedDoc, Schema } from "mongoose";

export interface ISettings extends Document {
  guildId: string;
  Channels: {
    vouches: string;
  };
}

const SettingsSchema: Schema = new Schema(
  {
    guildId: { type: String, required: true },
    Channels: {
      vouches: { type: String, required: false },
    },
  },
  { timestamps: true }
);

export default mongoose.model<ISettings>("Settings", SettingsSchema);
