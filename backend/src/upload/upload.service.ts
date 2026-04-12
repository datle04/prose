import { BadRequestException, Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { Express } from 'express';
import { Multer } from 'multer';

@Injectable()
export class UploadService {
    constructor() {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });
    }

    async uploadImage(file: any): Promise<string> {
        if(!file) throw new BadRequestException('No file provided');

        return new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {folder: 'prose', resource_type: 'image'},
                (error, result) => {
                    if (error || !result) return reject(new BadRequestException('Upload failed'));
                    resolve(result.secure_url);
                },
            ).end(file.buffer);
        });
    }
}
