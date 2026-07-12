import { Schema, model, type Document, type Types } from 'mongoose';
import { ANSWER_BODY_MIN, ANSWER_BODY_MAX } from '../utils/validation';

export interface IAnswer extends Document {
  body: string;
  questionId: Types.ObjectId;
  authorId: Types.ObjectId;
  createdAt: Date;
}

const answerSchema = new Schema<IAnswer>({
  body: {
    type: String,
    required: true,
    trim: true,
    minlength: ANSWER_BODY_MIN,
    maxlength: ANSWER_BODY_MAX,
  },
  questionId: { type: Schema.Types.ObjectId, ref: 'Question', required: true },
  authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});

export const Answer = model<IAnswer>('Answer', answerSchema);
