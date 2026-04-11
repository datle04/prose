import { IsString, IsBoolean, IsOptional, IsArray, MinLength } from 'class-validator';

export class CreatePostDto {
    @IsString()
    @MinLength(5)
    title!: string;

    @IsString()
    @MinLength(10)
    content!: string;

    @IsOptional()
    @IsString()
    thumbnail?: string;

    @IsOptional()
    @IsBoolean()
    published?: boolean;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tagIds?: string[];
}