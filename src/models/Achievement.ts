import mongoose, { Document, Model, Schema } from "mongoose";

export interface IAchievement extends Document {
  title: string;
  description: string;
  date: Date;
  imageUrl?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const AchievementSchema = new Schema<IAchievement>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    imageUrl: { type: String, default: "" },
    order: { type: Number, required: true, default: 0 },
  },
  { timestamps: true },
);

if (mongoose.models.Achievement) {
  delete mongoose.models.Achievement;
}

const Achievement: Model<IAchievement> = mongoose.model<IAchievement>(
  "Achievement",
  AchievementSchema,
);

export default Achievement;
