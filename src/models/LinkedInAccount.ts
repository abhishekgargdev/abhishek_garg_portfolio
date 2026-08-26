import mongoose, { Document, Model, Schema } from "mongoose";

export interface ILinkedInExperience {
  title: string;
  company: string;
  startDate: string;
  endDate: string | null;
  description: string;
}

export interface ILinkedInEducation {
  degree: string;
  institution: string;
  year: string;
  highlights: string[];
}

export interface ILinkedInProject {
  title: string;
  description: string;
  techStack: string[];
  liveUrl: string;
  githubUrl: string;
}

export interface ILinkedInSkill {
  name: string;
}

export interface ILinkedInAchievement {
  title: string;
  description: string;
  date: string;
}

export interface ILinkedInProfile {
  name: string;
  headline: string;
  bio: string;
  imageUrl: string;
  email: string;
  experiences: ILinkedInExperience[];
  education: ILinkedInEducation[];
  projects: ILinkedInProject[];
  skills: ILinkedInSkill[];
  achievements: ILinkedInAchievement[];
}

export interface ILinkedInAccount extends Document {
  accessToken: string;
  expiresAt: Date;
  isConnected: boolean;
  profile: ILinkedInProfile;
  createdAt: Date;
  updatedAt: Date;
}

const LinkedInExperienceSchema = new Schema<ILinkedInExperience>(
  {
    title: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    startDate: { type: String, required: true },
    endDate: { type: String, default: null },
    description: { type: String, default: "" },
  },
  { _id: false },
);

const LinkedInEducationSchema = new Schema<ILinkedInEducation>(
  {
    degree: { type: String, required: true, trim: true },
    institution: { type: String, required: true, trim: true },
    year: { type: String, required: true, trim: true },
    highlights: { type: [String], default: [] },
  },
  { _id: false },
);

const LinkedInProjectSchema = new Schema<ILinkedInProject>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    techStack: { type: [String], default: [] },
    liveUrl: { type: String, default: "" },
    githubUrl: { type: String, default: "" },
  },
  { _id: false },
);

const LinkedInSkillSchema = new Schema<ILinkedInSkill>(
  {
    name: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const LinkedInAchievementSchema = new Schema<ILinkedInAchievement>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    date: { type: String, required: true },
  },
  { _id: false },
);

const LinkedInProfileSchema = new Schema<ILinkedInProfile>(
  {
    name: { type: String, required: true, trim: true },
    headline: { type: String, default: "", trim: true },
    bio: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
    email: { type: String, default: "", trim: true, lowercase: true },
    experiences: { type: [LinkedInExperienceSchema], default: [] },
    education: { type: [LinkedInEducationSchema], default: [] },
    projects: { type: [LinkedInProjectSchema], default: [] },
    skills: { type: [LinkedInSkillSchema], default: [] },
    achievements: { type: [LinkedInAchievementSchema], default: [] },
  },
  { _id: false },
);

const LinkedInAccountSchema = new Schema<ILinkedInAccount>(
  {
    accessToken: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    isConnected: { type: Boolean, default: true },
    profile: { type: LinkedInProfileSchema, required: true },
  },
  { timestamps: true },
);

if (mongoose.models.LinkedInAccount) {
  delete mongoose.models.LinkedInAccount;
}

const LinkedInAccount: Model<ILinkedInAccount> = mongoose.model<ILinkedInAccount>(
  "LinkedInAccount",
  LinkedInAccountSchema,
);

export default LinkedInAccount;
