import { Schema, model, type Document, type Types } from 'mongoose';

export interface IQuestion extends Document {
  title: string;
  body: string;
  tags: string[];
  authorId: Types.ObjectId;
  createdAt: Date;
}

const questionSchema = new Schema<IQuestion>({
  title: { type: String, required: true, trim: true },
  body: { type: String, required: true },
  tags: { type: [String], default: [] },
  authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});

export const Question = model<IQuestion>('Question', questionSchema);
