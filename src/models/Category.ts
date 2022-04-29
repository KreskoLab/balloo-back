import { Lang } from './Lang';
import { Schema, Document, model } from 'mongoose';

export type Category = {
  name: Lang[];
  slug: string;
  subcategories: string[];
};

const categorySchema = new Schema({
  name: {
    type: Object,
    required: true,
  },
  slug: {
    type: String,
    lowercase: true,
    required: true,
  },
  subcategories: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Subcategory',
    },
  ],
});

export const CategoryModel = model<Category & Document>('Category', categorySchema);
