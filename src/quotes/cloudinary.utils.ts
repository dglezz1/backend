

import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';



/**
 * Configura Cloudinary usando variables de entorno. Lanza error si falta alguna variable.
 */
export function configureCloudinary() {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new Error('Faltan variables de entorno de Cloudinary. Verifica CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET.');
  }
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true,
  });
}


/**
 * Sube un archivo a Cloudinary en la carpeta 'quotes'.
 * @param file Archivo Multer recibido en el endpoint
 * @returns UploadApiResponse de Cloudinary
 */
/**
 * Sube un archivo a Cloudinary en la carpeta 'quotes'.
 * @param file Archivo Multer recibido en el endpoint
 * @returns UploadApiResponse de Cloudinary
 */
export async function uploadToCloudinary(file: Express.Multer.File): Promise<UploadApiResponse> {
  if (!file || !file.buffer) {
    throw new Error('Archivo inválido para subir a Cloudinary.');
  }
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'quotes', resource_type: 'auto' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result as UploadApiResponse);
      },
    );
    Readable.from(file.buffer).pipe(uploadStream);
  });
}
