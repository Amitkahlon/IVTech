import { Schema, model, type Document } from 'mongoose';

export interface IUser extends Document {
  nickname: string;
  fullName: string;
  passwordHash: string;
}

const userSchema = new Schema<IUser>({
  nickname: { type: String, required: true, unique: true, trim: true },
  fullName: { type: String, required: true, trim: true },
  // SHA-512 hex digest is always 128 characters
  passwordHash: { type: String, required: true, minlength: 128, maxlength: 128 },
});

export const User = model<IUser>('User', userSchema);
