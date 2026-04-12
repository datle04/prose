import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { NotificationsService } from 'src/notifications/notifications.service';

@Injectable()
export class CommentsService {
    constructor(
        private prisma: PrismaService,
        private notificationsService: NotificationsService,
    ){}

    // GET COMMENTS
    async getComments(postId: string) {
        return this.prisma.comment.findMany({
            where: { postId, parentId: null },
            orderBy: { createdAt: 'desc' },
            include: {
                author: { select: { id: true, name: true, username: true, avatar: true } },
                replies: {
                    orderBy: { createdAt: 'asc' },
                    include: {
                        author: { select: { id: true, name: true, username: true, avatar: true } },
                    },
                },
            },
        });
    };

    // CREATE COMMENTS
    async create(postId: string, authorId: string, dto: CreateCommentDto){
        // 1. Validate post
        const post = await this.prisma.post.findUnique({
            where: { id: postId },
            select: { authorId: true, title: true },
        });
        if (!post) throw new NotFoundException('Post not found');

        // 2. Validate parent (if reply case)
        let parent: { authorId: string } | null = null;

        if (dto.parentId) {
                parent = await this.prisma.comment.findUnique({
                where: { id: dto.parentId },
                select: { authorId: true },
            });
            if (!parent) throw new NotFoundException('Parent comment not found');
        }

        // 3. create comment
        const comment = await this.prisma.comment.create({
            data: { content: dto.content, postId, authorId, parentId: dto.parentId },
            include: {
                author: { select: { id: true, name: true, username: true, avatar: true } },
            },
        });

        // 4. Create notification
        if (post.authorId !== authorId) {
            await this.notificationsService.create(
                post.authorId,
                'COMMENT',
                `Someone commented on your post "${post.title}"`,
                postId,
            );
        }

        if (parent && parent.authorId !== authorId) {
            await this.notificationsService.create(
                parent.authorId,
                'REPLY',
                'Someone replied to your comment',
                dto.parentId!,
            );
        };

     return comment;
    };

    // REMOVE COMMENTS
    async remove(commentId: string, userId: string, role: string){
        const comment = await this.prisma.comment.findUnique({
            where: { id: commentId },
        });

        if(!comment) throw new NotFoundException('Comment not found');
        if(comment.authorId !== userId && role !== 'ADMIN'){
            throw new ForbiddenException('You can only delete your own comments');
        }

        await this.prisma.comment.delete({ where: { id: commentId } });
        return { message: 'Comment deleted' };
    };
}
