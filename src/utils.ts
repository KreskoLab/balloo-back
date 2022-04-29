import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import slugify from 'slugify';
import path from 'path';

export async function saveImage(file: any): Promise<string> {
  const buffer = await file.toBuffer();
  const ext = path.extname(file.filename);
  const name = uuidv4();
  const folder = process.cwd() + '/images/';

  await fs.writeFile(folder + name + ext, buffer);

  return name + ext;
}

export async function removeImage(image: string): Promise<void> {
  const folder = process.cwd() + '/images/';
  await fs.rm(folder + image);
}

export function slugItem(item: string): string {
  return slugify(item);
}
