import { Schema, Document, model } from 'mongoose';
import { Lang } from './Lang';

export type Property = {
  lang: string;
  value: string;
  name: string;
  slug: string;
  valueSlug: string;
};

export type Product = {
  name: Lang[];
  slug: string;
  description: Lang[];
  price: number;
  quantity: number;
  code: string;
  image: string[];
  subcategory: string;
  properties: Property[];
};

const productSchema = new Schema({
  name: {
    type: Array,
    required: true,
  },
  slug: {
    type: String,
    lowercase: true,
    unique: true,
    required: true,
  },
  description: {
    type: Array,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  code: {
    type: String,
    unique: true,
    required: true,
  },
  image: {
    type: Array,
    required: true,
  },
  subcategory: {
    type: Schema.Types.ObjectId,
    ref: 'Subcategory',
  },
  properties: {
    type: Array,
    required: true,
  },
});

export const ProductModel = model<Product & Document>('Product', productSchema);
