import mongoose, { Document, Model, Schema } from "mongoose";

export interface ITimelineEntry extends Document {
  role: string;
  company: string;
  startDate: Date;
  endDate: Date | null;
  description: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const TimelineEntrySchema = new Schema<ITimelineEntry>(
  {
    role: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, default: null },
    description: { type: String, required: true },
    order: { type: Number, required: true, default: 0 },
  },
  { timestamps: true },
);

const TimelineEntry: Model<ITimelineEntry> =
  mongoose.models.TimelineEntry ||
  mongoose.model<ITimelineEntry>("TimelineEntry", TimelineEntrySchema);

export default TimelineEntry;
