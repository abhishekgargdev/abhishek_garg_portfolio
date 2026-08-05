import mongoose, { Document, Model, Schema } from "mongoose";

export interface IExperience extends Document {
  role: string;
  company: string;
  description?: string;
  startDate: Date;
  endDate: Date | null;
  bullets: string[];
  techStack: string[];
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const ExperienceSchema = new Schema<IExperience>(
  {
    role: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },
    startDate: { type: Date, required: true },
    endDate: { type: Date, default: null },
    bullets: { type: [String], default: [] },
    techStack: { type: [String], default: [] },
    order: { type: Number, required: true, default: 0 },
  },
  { timestamps: true },
);

const Experience: Model<IExperience> =
  mongoose.models.Experience ||
  mongoose.model<IExperience>("Experience", ExperienceSchema);

export default Experience;
