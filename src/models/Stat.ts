import mongoose, { Document, Model, Schema } from "mongoose";

export interface IStat extends Document {
  label: string;
  value: number;
  suffix: string;
  iconKey: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const StatSchema = new Schema<IStat>(
  {
    label: { type: String, required: true, trim: true },
    value: { type: Number, required: true, min: 0 },
    suffix: { type: String, default: "" },
    iconKey: {
      type: String,
      required: true,
      trim: true,
      default: "briefcase",
    },
    order: { type: Number, required: true, default: 0 },
  },
  { timestamps: true },
);

const Stat: Model<IStat> =
  mongoose.models.Stat || mongoose.model<IStat>("Stat", StatSchema);

export default Stat;
