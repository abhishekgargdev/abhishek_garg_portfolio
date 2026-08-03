import mongoose, { Document, Model, Schema } from "mongoose";

export interface IProject extends Document {
  title: string;
  techStack: string[];
  description: string;
  bullets: string[];
  liveUrl: string;
  githubUrl: string;
  imageUrl: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    title: { type: String, required: true, trim: true },
    techStack: { type: [String], default: [] },
    description: { type: String, required: true },
    bullets: { type: [String], default: [] },
    liveUrl: { type: String, default: "" },
    githubUrl: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
    order: { type: Number, required: true, default: 0 },
  },
  { timestamps: true },
);

const Project: Model<IProject> =
  mongoose.models.Project ||
  mongoose.model<IProject>("Project", ProjectSchema);

export default Project;
