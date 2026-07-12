import { Schema, model, type Document, type Types } from 'mongoose';

export interface IVote extends Document {
  answerId: Types.ObjectId;
  userId: Types.ObjectId;
  value: 1 | -1;
}

const voteSchema = new Schema<IVote>({
  answerId: { type: Schema.Types.ObjectId, ref: 'Answer', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  value: { type: Number, enum: [1, -1], required: true },
});

// One vote per user per answer
voteSchema.index({ answerId: 1, userId: 1 }, { unique: true });

export const Vote = model<IVote>('Vote', voteSchema);
