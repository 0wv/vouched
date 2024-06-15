import mongoose, { PopulatedDoc, Schema } from "mongoose";

export interface IVouches extends Document {
  guildId: string;
  vouchUser: string;
  vouchedBy: string;
  stars: number;
  note: string;
}

const VouchesSchema: Schema = new Schema(
  {
    guildId: { type: String, required: true },
    vouchedUser: { type: String, required: true },
    vouchedBy: { type: String, required: true },
    stars: { type: Number, required: true },
    note: { type: String, required: false },
  },
  { timestamps: true }
);

export default mongoose.model<IVouches>("Vouches", VouchesSchema);
