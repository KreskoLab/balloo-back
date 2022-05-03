import fs from 'fs/promises';
import { constants } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import slugify from 'slugify';
import path from 'path';

export async function saveImage(file: any): Promise<string> {
  await folderExist();

  const buffer = await file.toBuffer();
  const ext = path.extname(file.filename);
  const name = uuidv4();
  const folder = process.cwd() + '/images/';

  await fs.writeFile(folder + name + ext, buffer);

  return name + ext;
}

async function folderExist(): Promise<void> {
  try {
    await fs.access(`${process.cwd()}/images`, constants.R_OK | constants.W_OK);
  } catch (error) {
    await fs.mkdir(`${process.cwd()}/images`);
  }
}

export async function removeImage(image: string): Promise<void> {
  const folder = process.cwd() + '/images/';
  await fs.rm(folder + image);
}

export function slugItem(item: string): string {
  return slugify(item);
}
