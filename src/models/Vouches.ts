import mongoose, { PopulatedDoc, Schema } from "mongoose";

export interface IVouches extends Document {
  guildId: string;
  vouchUser: string;
  vouchedBy: string;
  stars: number;
  note: string;
  amount: number;
  createdAt: Date;
}

const VouchesSchema: Schema = new Schema(
  {
    guildId: { type: String, required: true },
    vouchedUser: { type: String, required: true },
    vouchedBy: { type: String, required: true },
    stars: { type: Number, required: true },
    note: { type: String, required: false },
    amount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model<IVouches>("Vouches", VouchesSchema);
