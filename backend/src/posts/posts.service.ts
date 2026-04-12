import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import slugify from 'slugify';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
    constructor(private prisma: PrismaService){}

    // GENERATE SLUG
    private generateSlug(title: string): string {
        return slugify(title, { lower: true, strict: true }) + '-' + Date.now();
    };
    
    // CREATE POST
    async create(authorId: string, dto: CreatePostDto) {
        const slug = this.generateSlug(dto.title);

        return this.prisma.post.create({
            data: {
                title: dto.title,
                slug,
                content: dto.content,
                thumbnail: dto.thumbnail,
                published: dto.published ?? false,
                authorId,
                tags: dto.tagIds
                    ? { connect: dto.tagIds.map((id) => ({ id })) }
                    : undefined
            },
            include: { tags: true, author: { select: { id: true, name: true, username: true } } },
        });
    };

    // GET ALL
    async findAll(page: number = 1, limit: number = 10) {
        const skip = (page - 1) * limit;

        const [posts, total] = await Promise.all([
            this.prisma.post.findMany({
                where: { published: true },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
                include: {
                    author: { select: { id: true, name: true, username: true, avatar: true } },
                    tags: true,
                    _count: { select: { likes: true, comments: true } },
                },
            }),
            this.prisma.post.count({ where: { published: true } }),
        ]);

        return {
            posts,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    };

    // GET POST BY SLUG
    async finndBySlug(slug: string) {
        const post = await this.prisma.post.findUnique({
            where: { slug },
            include: {
                author: { select: { id: true, name: true, username: true, avatar: true } },
                tags: true,
                _count: { select: { likes: true, comments: true } },
            },
        });

        if(!post) throw new NotFoundException('Post not found');

        await this.prisma.post.update({
            where: { slug },
            data: { viewCount: { increment: 1 } },
        });

        return post;
    };

    // UPDATE POST
    async update(postId: string, userId: string, role: string, dto: UpdatePostDto){
        const post = await this.prisma.post.findUnique({ where: { id: postId } });
        
        if(!post) throw new NotFoundException('Post not found');
        if (post.authorId !== userId && role !== 'ADMIN') {
            throw new ForbiddenException('You can only edit your own posts');
        }

        const { tagIds, ...rest } = dto; 

        return this.prisma.post.update({
            where: { id: postId },
            data: {
                ...rest,
                tags: tagIds
                    ? { set: tagIds.map((id) => ({ id })) }
                    : undefined,
            },
        });
    };

    // DELETE POST
    async remove(postId: string, userId: string, role: string) {
        const post = await this.prisma.post.findUnique({ where: { id: postId } });

        if(!post) throw new NotFoundException('Post not found');
        if(post.authorId !== userId && role !== 'ADMIN') {
            throw new ForbiddenException('You can only delete your own posts');
        }

        await this.prisma.post.delete({ where: { id: postId } });
        
        return { message: 'Post deleted' };
    };

    // TOGGLE PUBLISH
    async togglePublish(postId: string, userId: string) {
        const post = await this.prisma.post.findUnique({ where: { id: postId } });

        if(!post) throw new NotFoundException('Post not found');
        if(post.authorId !== userId) throw new ForbiddenException('You can only publish your own posts');

        return this.prisma.post.update({
            where: { id: postId },
            data: { published: !post.published },
        });
    };

    // TOGGLE LIKE
    async toggleLike(postId: string, userId: string){
        const existing = await this.prisma.like.findUnique({
            where: { userId_postId: { userId, postId } },
        });

        if (existing) {
            await this.prisma.like.delete({
                where: { userId_postId: { userId, postId } },
            });

            return { liked: false };
        };

        await this.prisma.like.create({ data: {userId, postId } });

        return { liked: true };
    };

    // TOGGLE BOOKMARK
    async toggleBookmark(postId: string, userId: string) {
        const existing = await this.prisma.bookmark.findUnique({
            where: { userId_postId: { userId, postId } },
        });

        if(existing) {
            await this.prisma.bookmark.delete({
                where: { userId_postId: { userId, postId } },
            });
            
            return { bookmarked: false };
        };

        await this.prisma.bookmark.create({ data: { userId, postId } });

        return { bookmarked: true };
    }
}
