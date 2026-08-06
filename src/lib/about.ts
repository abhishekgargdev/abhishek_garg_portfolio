import { connectDB } from "@/lib/db";
import { normalizeTaglines } from "@/lib/about-taglines";
import AboutMe from "@/models/AboutMe";

export type AboutMeData = {
  name: string;
  title: string;
  taglines: string[];
  bio: string;
  profileImageUrl: string;
  resumeFileUrl: string;
  socialLinks: { platform: string; url: string }[];
  location: string;
  phone: string;
  email: string;
  beyondCodeBio?: string;
  beyondCodeImageUrl?: string;
  beyondCodeTraits?: { title: string; description: string; icon: string }[];
};

export async function getAboutMe(): Promise<AboutMeData | null> {
  await connectDB();

  const doc = await AboutMe.findOne().sort({ updatedAt: -1 }).lean();
  if (!doc) return null;

  return {
    name: doc.name,
    title: doc.title,
    taglines: normalizeTaglines(doc.tagline, doc.taglines),
    bio: doc.bio,
    profileImageUrl: doc.profileImageUrl ?? "",
    resumeFileUrl: doc.resumeFileUrl ?? "",
    socialLinks: (doc.socialLinks ?? []).map((link) => ({
      platform: link.platform,
      url: link.url,
    })),
    location: doc.location ?? "",
    phone: doc.phone ?? "",
    email: doc.email,
    beyondCodeBio: doc.beyondCodeBio ?? "",
    beyondCodeImageUrl: doc.beyondCodeImageUrl ?? "",
    beyondCodeTraits: (doc.beyondCodeTraits ?? []).map((trait) => ({
      title: trait.title,
      description: trait.description,
      icon: trait.icon,
    })),
  };
}
