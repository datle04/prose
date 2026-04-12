import { Controller, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UploadService } from './upload.service';
import { FileInterceptor } from '@nestjs/platform-express';
import * as path from 'path';

@Controller('upload')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('AUTHOR', 'ADMIN')
export class UploadController {
    constructor(private uploadService: UploadService){}

    @Post('image')
    @UseInterceptors(FileInterceptor('file', {
        limits: { fileSize: 5 * 1024 * 1024 },
        fileFilter: (req, file, cb) => {
            const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
            const allowedExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
            const ext = path.extname(file.originalname).toLowerCase();

            if (allowedMimes.includes(file.mimetype) || allowedExts.includes(ext)) {
                cb(null, true);
            } else {
                cb(new Error('Only image files are allowed'), false);
            }
        },
    }))
    uploadImage(@UploadedFile() file: any) {
        return this.uploadService.uploadImage(file);
    }
}
