import { Schema, Document, model } from 'mongoose';
import { Filter } from './Filter';
import { Lang } from './Lang';
import { Product } from './Product';

export type Subcategory = {
  name: Lang[];
  slug: string;
  image: string;
  filter: string & Filter;
  products: string[];
};

const subcategorySchema = new Schema({
  name: {
    type: Array,
    required: true,
  },
  slug: {
    type: String,
    lowercase: true,
    required: true,
  },
  image: {
    type: String,
    unique: true,
  },
  filter: {
    type: Schema.Types.ObjectId,
    ref: 'Filter',
  },
  products: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Product',
    },
  ],
});

export const SubcategoryModel = model<Subcategory & Document>('Subcategory', subcategorySchema);
