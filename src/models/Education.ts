import mongoose, { Document, Model, Schema } from "mongoose";

export interface IEducation extends Document {
  degree: string;
  institution: string;
  year: string;
  highlights: string[];
  createdAt: Date;
  updatedAt: Date;
}

const EducationSchema = new Schema<IEducation>(
  {
    degree: { type: String, required: true, trim: true },
    institution: { type: String, required: true, trim: true },
    year: { type: String, required: true, trim: true },
    highlights: { type: [String], default: [] },
  },
  { timestamps: true },
);

const Education: Model<IEducation> =
  mongoose.models.Education ||
  mongoose.model<IEducation>("Education", EducationSchema);

export default Education;
