import { Schema, Document, model } from 'mongoose';

export type User = {
  id: string;
  name: string;
  email: string;
  admin: boolean;
  img: string;
  provider: string;
  phone: string;
};

const userSchema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 128,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    minlength: 1,
    maxlength: 128,
  },
  img: {
    type: String,
  },
  provider: {
    type: String,
  },
  phone: {
    type: String,
  },
});

export const UserModel = model<User & Document>('User', userSchema);
