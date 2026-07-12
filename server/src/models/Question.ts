import { Schema, model, type Document, type Types } from 'mongoose';
import {
  QUESTION_TITLE_MIN,
  QUESTION_TITLE_MAX,
  QUESTION_BODY_MIN,
  QUESTION_BODY_MAX,
  TAG_MAX_LENGTH,
  TAGS_MAX_COUNT,
} from '../utils/validation';

export interface IQuestion extends Document {
  title: string;
  body: string;
  tags: string[];
  authorId: Types.ObjectId;
  createdAt: Date;
}

const questionSchema = new Schema<IQuestion>({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: QUESTION_TITLE_MIN,
    maxlength: QUESTION_TITLE_MAX,
  },
  body: {
    type: String,
    required: true,
    trim: true,
    minlength: QUESTION_BODY_MIN,
    maxlength: QUESTION_BODY_MAX,
  },
  tags: {
    type: [String],
    default: [],
    validate: {
      validator: (tags: string[]) =>
        tags.length <= TAGS_MAX_COUNT && tags.every((tag) => tag.trim().length > 0 && tag.length <= TAG_MAX_LENGTH),
      message: `Up to ${TAGS_MAX_COUNT} tags allowed, each 1-${TAG_MAX_LENGTH} characters`,
    },
  },
  authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});

export const Question = model<IQuestion>('Question', questionSchema);
