import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import slugify from 'slugify';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { Resend } from 'resend';

@Injectable()
export class PostsService {
    constructor(
        private prisma: PrismaService,
        private notificationsService: NotificationsService,
    ){}

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

    // GET FOLLOWING FEED
    async getFeed(userId: string, page: number = 1, limit: number = 10) {
        const skip = (page - 1) * limit;

        // Lấy danh sách người đang follow
        const following = await this.prisma.follow.findMany({
            where: { followerId: userId },
            select: { followingId: true },
        });

        const followingIds = following.map((f) => f.followingId);

        const [posts, total] = await Promise.all([
            this.prisma.post.findMany({
                where: { published: true, authorId: { in: followingIds } },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
                include: {
                    author: { select: { id: true, name: true, username: true, avatar: true } },
                    tags: true,
                    _count: { select: { likes: true, comments: true } },
                },
            }),
            this.prisma.post.count({
                where: { published: true, authorId: { in: followingIds } },
            }),
        ]);

        return {
            posts,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }

    // GET POST BY ID
    async findById(postId: string) {
        const post = await this.prisma.post.findUnique({
            where: { id: postId },
            include: { tags: true },
        });
        if (!post) throw new NotFoundException('Post not found');
        return post;
    }

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

    // GET MY POSTS
    async getMyPosts(authorId: string) {
        return this.prisma.post.findMany({
            where: { authorId },
            orderBy: { createdAt: 'desc' },
            include: {
                tags: true,
                _count: { select: { likes: true, comments: true } },
            },
        });
    }


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

        if (!post) throw new NotFoundException('Post not found');
        if (post.authorId !== userId) throw new ForbiddenException('You can only publish your own posts');

        const updated = await this.prisma.post.update({
            where: { id: postId },
            data: { published: !post.published },
            include: { author: { select: { name: true } } },
        });

        // Gửi email cho subscribers khi publish
        if (updated.published) {
            const subscribers = await this.prisma.subscriber.findMany({
                select: { email: true },
            });

            if (subscribers.length > 0) {
                const resend = new Resend(process.env.RESEND_API_KEY);
                const emails = subscribers.map((s) => s.email);

                resend.emails.send({
                    from: 'onboarding@resend.dev',
                    to: emails,
                    subject: `New post: ${updated.title}`,
                    html: `<p><strong>${updated.author.name}</strong> just published a new post: <strong>${updated.title}</strong></p>`,
                }).catch((err) => console.error('Resend error:', err));
            }
        }

        return updated;
    }

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

        // Create notification
        const post = await this.prisma.post.findUnique({
            where: { id: postId },
            select: { authorId: true, title: true },
        });

        if(post && post.authorId !== userId) {
            await this.notificationsService.create(
                post.authorId,
                'LIKE',
                `Someone liked your post "${post.title}"`,
                postId,
            );
        }

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

    // SEARCH
    async search(query: {
        q?: string;
        tag?: string;
        author?: string;
        from?: string;
        to?: string;
        page?: number;
        limit?: number;
    }){
        const { q, tag, author, from, to } = query;
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;

        const skip = (page - 1) * limit;

        const where: any = {
            published: true,
            ...(q && {
                OR: [
                    { title: { contains: q, mode: 'insensitive' } },
                    { content: { contains: q, mode: 'insensitive' } },
                ],
            }),
            ...(tag && { tags: { some: { slug: tag } } }),
            ...(author && { author: { username: author } }),
            ...(from || to
                ? {
                    createdAt: {
                        ...(from && { gte: new Date(from) }),
                        ...(to && { lte: new Date(to) }),
                    },
                }
                : {}),
        };

        const [posts, total] = await Promise.all([
            this.prisma.post.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    author: { select: { id: true, name: true, username: true, avatar: true } },
                    tags: true,
                    _count: { select: { likes: true, comments: true } },
                },
            }),
            this.prisma.post.count({ where }),
        ]);

        return {
            posts,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        }
    };
}
