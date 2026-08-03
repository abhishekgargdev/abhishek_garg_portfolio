import mongoose, { Document, Model, Schema } from "mongoose";

export interface ISocialLink {
  platform: string;
  url: string;
}

export interface IAboutMe extends Document {
  name: string;
  title: string;
  tagline: string;
  bio: string;
  profileImageUrl: string;
  resumeFileUrl: string;
  socialLinks: ISocialLink[];
  location: string;
  phone: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

const SocialLinkSchema = new Schema<ISocialLink>(
  {
    platform: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const AboutMeSchema = new Schema<IAboutMe>(
  {
    name: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    tagline: { type: String, required: true, trim: true },
    bio: { type: String, required: true },
    profileImageUrl: { type: String, default: "" },
    resumeFileUrl: { type: String, default: "" },
    socialLinks: { type: [SocialLinkSchema], default: [] },
    location: { type: String, default: "" },
    phone: { type: String, default: "" },
    email: { type: String, required: true, trim: true, lowercase: true },
  },
  { timestamps: true },
);

const AboutMe: Model<IAboutMe> =
  mongoose.models.AboutMe ||
  mongoose.model<IAboutMe>("AboutMe", AboutMeSchema);

export default AboutMe;
