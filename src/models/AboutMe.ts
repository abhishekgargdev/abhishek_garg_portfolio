import mongoose, { Document, Model, Schema } from "mongoose";

export interface ISocialLink {
  platform: string;
  url: string;
}

export interface IBeyondCodeTrait {
  title: string;
  description: string;
  icon: string;
}

export interface IAboutMe extends Document {
  name: string;
  title: string;
  /** @deprecated Prefer taglines. Kept as a denormalized first tagline for legacy validators. */
  tagline: string;
  taglines: string[];
  bio: string;
  profileImageUrl: string;
  resumeFileUrl: string;
  socialLinks: ISocialLink[];
  location: string;
  phone: string;
  email: string;
  beyondCodeBio?: string;
  beyondCodeImageUrl?: string;
  beyondCodeTraits?: IBeyondCodeTrait[];
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

const BeyondCodeTraitSchema = new Schema<IBeyondCodeTrait>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    icon: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const AboutMeSchema = new Schema<IAboutMe>(
  {
    name: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    tagline: { type: String, default: "", trim: true },
    taglines: { type: [String], default: [] },
    bio: { type: String, required: true },
    profileImageUrl: { type: String, default: "" },
    resumeFileUrl: { type: String, default: "" },
    socialLinks: { type: [SocialLinkSchema], default: [] },
    location: { type: String, default: "" },
    phone: { type: String, default: "" },
    email: { type: String, required: true, trim: true, lowercase: true },
    beyondCodeBio: { type: String, default: "" },
    beyondCodeImageUrl: { type: String, default: "" },
    beyondCodeTraits: { type: [BeyondCodeTraitSchema], default: [] },
  },
  { timestamps: true },
);

// Keep legacy `tagline` populated from the first rotating line so older
// required validators / consumers never see an empty required path.
AboutMeSchema.pre("validate", function () {
  const taglines = Array.isArray(this.taglines)
    ? this.taglines.map((line) => String(line).trim()).filter(Boolean)
    : [];

  if (taglines.length) {
    this.taglines = taglines;
    this.tagline = taglines[0];
  } else if (typeof this.tagline === "string" && this.tagline.trim()) {
    this.taglines = [this.tagline.trim()];
  } else {
    this.tagline = this.tagline?.trim() || "";
  }
});

// Next.js HMR can keep a stale compiled model (e.g. old required tagline).
if (mongoose.models.AboutMe) {
  delete mongoose.models.AboutMe;
}

const AboutMe: Model<IAboutMe> = mongoose.model<IAboutMe>(
  "AboutMe",
  AboutMeSchema,
);

export default AboutMe;
