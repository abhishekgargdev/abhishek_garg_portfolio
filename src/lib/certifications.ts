import { connectDB } from "@/lib/db";
import Certification from "@/models/Certification";

export type CertificationData = {
  id: string;
  title: string;
  provider: string;
  date: string;
  credentialUrl: string;
  order: number;
};

export async function getCertifications(): Promise<CertificationData[]> {
  await connectDB();

  const docs = await Certification.find().sort({ order: 1, date: -1 }).lean();

  return docs.map((doc) => ({
    id: String(doc._id),
    title: doc.title,
    provider: doc.provider,
    date: new Date(doc.date).toISOString(),
    credentialUrl: doc.credentialUrl ?? "",
    order: doc.order,
  }));
}
