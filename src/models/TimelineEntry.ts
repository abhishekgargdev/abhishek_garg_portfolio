import mongoose, { Document, Model, Schema } from "mongoose";
import {
  TIMELINE_CATEGORIES,
  type TimelineCategory,
} from "@/lib/timeline-types";

export interface ITimelineEntry extends Document {
  category: TimelineCategory;
  /** Title / role / degree / award name */
  role: string;
  /** Company / school / issuer (optional for some categories) */
  company: string;
  startDate: Date;
  endDate: Date | null;
  description: string;
  /** Optional external link (credential URL, etc.) */
  link: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const TimelineEntrySchema = new Schema<ITimelineEntry>(
  {
    category: {
      type: String,
      enum: TIMELINE_CATEGORIES,
      required: true,
      default: "experience",
      index: true,
    },
    role: { type: String, required: true, trim: true },
    company: { type: String, default: "", trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, default: null },
    description: { type: String, required: true },
    link: { type: String, default: "", trim: true },
    order: { type: Number, required: true, default: 0 },
  },
  { timestamps: true },
);

if (mongoose.models.TimelineEntry) {
  delete mongoose.models.TimelineEntry;
}

const TimelineEntry: Model<ITimelineEntry> =
  mongoose.model<ITimelineEntry>("TimelineEntry", TimelineEntrySchema);

export default TimelineEntry;
