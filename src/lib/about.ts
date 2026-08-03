import { connectDB } from "@/lib/db";
import AboutMe from "@/models/AboutMe";

export type AboutMeData = {
  name: string;
  title: string;
  tagline: string;
  bio: string;
  profileImageUrl: string;
  resumeFileUrl: string;
  socialLinks: { platform: string; url: string }[];
  location: string;
  phone: string;
  email: string;
};

export async function getAboutMe(): Promise<AboutMeData | null> {
  await connectDB();

  const doc = await AboutMe.findOne().sort({ updatedAt: -1 }).lean();
  if (!doc) return null;

  return {
    name: doc.name,
    title: doc.title,
    tagline: doc.tagline,
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
  };
}
