import mongoose, { Document, Model, Schema } from "mongoose";

export interface IAchievement extends Document {
  title: string;
  description: string;
  date: Date;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const AchievementSchema = new Schema<IAchievement>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    order: { type: Number, required: true, default: 0 },
  },
  { timestamps: true },
);

const Achievement: Model<IAchievement> =
  mongoose.models.Achievement ||
  mongoose.model<IAchievement>("Achievement", AchievementSchema);

export default Achievement;
