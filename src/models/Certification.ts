import mongoose, { Document, Model, Schema } from "mongoose";

export interface ICertification extends Document {
  title: string;
  provider: string;
  date: Date;
  credentialUrl: string;
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
    order: { type: Number, required: true, default: 0 },
  },
  { timestamps: true },
);

const Certification: Model<ICertification> =
  mongoose.models.Certification ||
  mongoose.model<ICertification>("Certification", CertificationSchema);

export default Certification;
