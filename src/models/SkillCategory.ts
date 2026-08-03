import mongoose, { Document, Model, Schema } from "mongoose";

export interface ISkill {
  name: string;
  iconKey: string;
  proficiency: number;
}

export interface ISkillCategory extends Document {
  categoryName: string;
  skills: ISkill[];
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const SkillSchema = new Schema<ISkill>(
  {
    name: { type: String, required: true, trim: true },
    iconKey: { type: String, required: true, trim: true },
    proficiency: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
  },
  { _id: false },
);

const SkillCategorySchema = new Schema<ISkillCategory>(
  {
    categoryName: { type: String, required: true, trim: true },
    skills: { type: [SkillSchema], default: [] },
    order: { type: Number, required: true, default: 0 },
  },
  { timestamps: true },
);

const SkillCategory: Model<ISkillCategory> =
  mongoose.models.SkillCategory ||
  mongoose.model<ISkillCategory>("SkillCategory", SkillCategorySchema);

export default SkillCategory;
