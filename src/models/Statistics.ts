import mongoose, { PopulatedDoc, Schema } from "mongoose";

export interface IStats extends Document {
  guildId: string;
  guildName: string;
  vouches: {
    map(arg0: (vouch: any) => any): unknown[] | undefined;
    totalVouches: number;
    totalAmount: number;
  };
}

const StatsSchema: Schema = new Schema(
  {
    guildId: { type: String, required: true },
    guildName: { type: String, required: true },
    vouches: {
      totalVouches: { type: Number, default: 0 },
      totalAmount: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

export default mongoose.model<IStats>("Stats", StatsSchema);
