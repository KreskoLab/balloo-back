import { Schema, Document, model } from 'mongoose';
import { Lang } from './Lang';

export type Filter = {
  name: Lang[];
  filters: Lang[];
};

const filterSchema = new Schema({
  name: {
    type: Array,
    required: true,
  },

  filters: {
    type: Array,
    required: true,
  },
});

export const FilterModel = model<Filter & Document>('Filter', filterSchema);
