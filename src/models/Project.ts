import mongoose, { Document, Model, Schema } from "mongoose";

export interface IProjectResult {
  label: string;
  value: string;
}

export interface IProjectLink {
  label: string;
  url: string;
}

export interface IProject extends Document {
  title: string;
  slug: string;
  techStack: string[];
  description: string;
  bullets: string[];
  imageUrl: string;
  images: string[];
  category: string;
  status: "completed" | "ongoing" | "concept";
  featured: boolean;
  role: string;
  duration: string;
  problem: string;
  solution: string;
  features: string[];
  results: IProjectResult[];
  videoUrl?: string;
  liveUrl: string;
  githubUrl: string;
  links: IProjectLink[];
  directoryStructure: string;
  readmeMd: string;
  projectType: "personal" | "professional";
  company: string;
  teamSize: string;
  responsibilities: string[];
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectResultSchema = new Schema<IProjectResult>(
  {
    label: { type: String, required: true, trim: true },
    value: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const ProjectLinkSchema = new Schema<IProjectLink>(
  {
    label: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const ProjectSchema = new Schema<IProject>(
  {
    title: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    techStack: { type: [String], default: [] },
    description: { type: String, required: true },
    bullets: { type: [String], default: [] },
    imageUrl: { type: String, default: "" },
    images: { type: [String], default: [] },
    category: { type: String, default: "" },
    status: {
      type: String,
      enum: ["completed", "ongoing", "concept"],
      default: "completed",
    },
    featured: { type: Boolean, default: false },
    role: { type: String, default: "" },
    duration: { type: String, default: "" },
    problem: { type: String, default: "" },
    solution: { type: String, default: "" },
    features: { type: [String], default: [] },
    results: { type: [ProjectResultSchema], default: [] },
    videoUrl: { type: String, default: "" },
    liveUrl: { type: String, default: "" },
    githubUrl: { type: String, default: "" },
    links: { type: [ProjectLinkSchema], default: [] },
    directoryStructure: { type: String, default: "" },
    readmeMd: { type: String, default: "" },
    projectType: {
      type: String,
      enum: ["personal", "professional"],
      default: "personal",
    },
    company: { type: String, default: "" },
    teamSize: { type: String, default: "" },
    responsibilities: { type: [String], default: [] },
    order: { type: Number, required: true, default: 0 },
  },
  { timestamps: true },
);

if (mongoose.models.Project) {
  delete mongoose.models.Project;
}

const Project: Model<IProject> = mongoose.model<IProject>(
  "Project",
  ProjectSchema,
);

export default Project;
