import fs from 'fs/promises';
import { constants } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import slugify from 'slugify';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
  secure: true,
});

export async function saveImage(file: any): Promise<string> {
  await folderExist();

  const buffer = await file.toBuffer();
  const ext = path.extname(file.filename);
  const name = uuidv4();
  const folder = process.cwd() + '/images/';

  await fs.writeFile(folder + name + ext, buffer);

  const image = await cloudinary.uploader.upload(folder + name + ext, {
    folder: 'balloo',
  });

  fs.unlink(folder + name + ext);

  return image.public_id + ext;
}

async function folderExist(): Promise<void> {
  try {
    await fs.access(`${process.cwd()}/images`, constants.R_OK | constants.W_OK);
  } catch (error) {
    await fs.mkdir(`${process.cwd()}/images`);
  }
}

export function removeImage(image: string): void {
  cloudinary.uploader.destroy(path.parse(image).name);
}

export function slugItem(item: string): string {
  return slugify(item);
}
