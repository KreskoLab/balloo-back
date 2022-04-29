import { Lang } from '../../models/Filter';

export interface RequestBodyI {
  names: Lang[];
  newFilters: Lang[];
}
