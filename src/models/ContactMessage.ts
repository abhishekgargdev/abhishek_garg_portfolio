import mongoose, { Document, Model, Schema } from "mongoose";

export interface IContactMessage extends Document {
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  replyMessage?: string;
  repliedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ContactMessageSchema = new Schema<IContactMessage>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    replyMessage: { type: String },
    repliedAt: { type: Date },
  },
  { timestamps: true },
);

if (mongoose.models.ContactMessage) {
  delete mongoose.models.ContactMessage;
}

const ContactMessage: Model<IContactMessage> = mongoose.model<IContactMessage>(
  "ContactMessage",
  ContactMessageSchema,
);

export default ContactMessage;
