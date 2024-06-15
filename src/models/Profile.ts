import mongoose, { PopulatedDoc, Schema } from "mongoose";

export interface IProfile extends Document {
  guildId: string;
  user: {
    id: string;
    username: string;
    nickname: string;
  };
  vouches: number;
  totalAmount: number;
  updatedAt: Date;
}

const ProfileSchema: Schema = new Schema(
  {
    guildId: { type: String, required: true },
    user: {
      id: { type: String, required: true },
      username: { type: String, required: true },
      nickname: { type: String, required: false },
    },
    vouches: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model<IProfile>("Profile", ProfileSchema);
