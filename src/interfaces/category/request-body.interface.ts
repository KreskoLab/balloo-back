import { Lang } from '../../models/Lang';

export interface RequestBodyI {
  names: Lang[];
  subcategories: string[];
}
