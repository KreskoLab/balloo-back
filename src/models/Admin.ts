import { Schema, Document, model } from 'mongoose';

export type Admin = {
  login: string;
  password: string;
  refreshTokens: refresToken[];
};

export type refresToken = {
  token: string;
  createdAt: Date;
};

const adminSchema = new Schema({
  login: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
    select: false,
  },

  refreshTokens: {
    type: Array,
    select: false,
  },
});

export const AdminModel = model<Admin & Document>('Admin', adminSchema);
