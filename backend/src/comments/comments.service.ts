import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
    constructor(private prisma: PrismaService){}

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
        if (dto.parentId) {
            const parent = await this.prisma.comment.findUnique({
                where: { id: dto.parentId },
            });
            if(!parent) throw new NotFoundException('Parent comment not found');
        };

        return this.prisma.comment.create({
            data: {
                content: dto.content,
                postId,
                authorId,
                parentId: dto.parentId,
            },
            include: {
                author: { select: {id: true, name: true, username: true, avatar: true } },
            }
        });
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
