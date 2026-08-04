import mongoose, { Document, Model, Schema } from "mongoose";

export type AiInteractionStatus = "success" | "error";

export interface IAiInteraction extends Document {
  /** Logical feature name, e.g. "suggest-bio", "improve-bullets". */
  purpose: string;
  prompt: string;
  systemInstruction?: string;
  response: string;
  modelName: string;
  /** 1-based key slot from GEMINI_API_KEY_1..6 that produced the response. */
  keySlot: number;
  status: AiInteractionStatus;
  errorMessage?: string;
  metadata?: Record<string, unknown>;
  durationMs: number;
  createdAt: Date;
  updatedAt: Date;
}

const AiInteractionSchema = new Schema<IAiInteraction>(
  {
    purpose: { type: String, required: true, trim: true, index: true },
    prompt: { type: String, required: true },
    systemInstruction: { type: String, default: "" },
    response: { type: String, default: "" },
    modelName: { type: String, required: true, trim: true },
    keySlot: { type: Number, required: true, min: 1, max: 6 },
    status: {
      type: String,
      enum: ["success", "error"],
      required: true,
      default: "success",
    },
    errorMessage: { type: String, default: "" },
    metadata: { type: Schema.Types.Mixed, default: undefined },
    durationMs: { type: Number, required: true, min: 0 },
  },
  { timestamps: true },
);

AiInteractionSchema.index({ createdAt: -1 });
AiInteractionSchema.index({ purpose: 1, createdAt: -1 });

const AiInteraction: Model<IAiInteraction> =
  mongoose.models.AiInteraction ||
  mongoose.model<IAiInteraction>("AiInteraction", AiInteractionSchema);

export default AiInteraction;
