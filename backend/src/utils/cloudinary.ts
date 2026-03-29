import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { env } from '../config';

cloudinary.config({
    cloud_name: env.cloudinary.cloudName,
    api_key: env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret,
});

export async function uploadImage(
    fileBuffer: Buffer,
    folder: string = 'road-estimator'
): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder, resource_type: 'image' },
            (error, result) => {
                if (error || !result) return reject(error || new Error('Upload failed'));
                resolve(result);
            }
        );
        stream.end(fileBuffer);
    });
}

export async function deleteImage(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId);
}

export default cloudinary;
