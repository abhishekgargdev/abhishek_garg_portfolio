import mongoose, { Document, Model, Schema } from "mongoose";

export interface ITenurePeriod {
  _id?: mongoose.Types.ObjectId;
  title: string;
  company: string;
  startDate: Date;
  endDate: Date | null;
  countsTotal: boolean;
  countsRelevant: boolean;
}

export interface IExperienceTenure extends Document {
  totalLabel: string;
  relevantLabel: string;
  /** Single source of truth — each period toggles which clocks it counts toward. */
  periods: ITenurePeriod[];
  /**
   * @deprecated Migrated into `periods`. Kept for old documents.
   */
  totalPeriods?: Omit<ITenurePeriod, "countsTotal" | "countsRelevant">[];
  /**
   * @deprecated Migrated into `periods`. Kept for old documents.
   */
  relevantPeriods?: Omit<ITenurePeriod, "countsTotal" | "countsRelevant">[];
  /** @deprecated Migrated into periods. Kept for old documents. */
  totalStartDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TenurePeriodSchema = new Schema<ITenurePeriod>(
  {
    title: { type: String, required: true, trim: true },
    company: { type: String, default: "", trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, default: null },
    countsTotal: { type: Boolean, default: true },
    countsRelevant: { type: Boolean, default: false },
  },
  { _id: true },
);

/** Legacy period shape without clock toggles. */
const LegacyPeriodSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    company: { type: String, default: "", trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, default: null },
  },
  { _id: true },
);

const ExperienceTenureSchema = new Schema<IExperienceTenure>(
  {
    totalLabel: {
      type: String,
      required: true,
      trim: true,
      default: "Total Experience",
    },
    relevantLabel: {
      type: String,
      required: true,
      trim: true,
      default: "Relevant Experience",
    },
    periods: { type: [TenurePeriodSchema], default: [] },
    totalPeriods: { type: [LegacyPeriodSchema], default: undefined },
    relevantPeriods: { type: [LegacyPeriodSchema], default: undefined },
    totalStartDate: { type: Date, required: false },
  },
  { timestamps: true },
);

if (mongoose.models.ExperienceTenure) {
  delete mongoose.models.ExperienceTenure;
}

const ExperienceTenure: Model<IExperienceTenure> =
  mongoose.model<IExperienceTenure>("ExperienceTenure", ExperienceTenureSchema);

export default ExperienceTenure;
