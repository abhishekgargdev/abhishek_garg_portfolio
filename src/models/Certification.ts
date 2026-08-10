import mongoose, { Document, Model, Schema } from "mongoose";

export interface ICertification extends Document {
  title: string;
  provider: string;
  date: Date;
  credentialUrl: string;
  imageUrl?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const CertificationSchema = new Schema<ICertification>(
  {
    title: { type: String, required: true, trim: true },
    provider: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    credentialUrl: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
    order: { type: Number, required: true, default: 0 },
  },
  { timestamps: true },
);

if (mongoose.models.Certification) {
  delete mongoose.models.Certification;
}

const Certification: Model<ICertification> = mongoose.model<ICertification>(
  "Certification",
  CertificationSchema,
);

export default Certification;
