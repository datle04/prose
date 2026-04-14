import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AdminService {
    constructor (private prisma: PrismaService){}

    // GET STATS
    async getStats(){
        const [users, posts, comments, reports] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.post.count(),
            this.prisma.comment.count(),
            this.prisma.report.count()
        ]);

        return { users, posts, comments, reports };
    }

    // GET USERS
    async getUsers(){
        return this.prisma.user.findMany({
            select: {
                id: true,
                name: true,
                username: true,
                email: true,
                role: true,
                isActive: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    // BAN USER
    async banUser(userId: string){
        const user = await this.prisma.user.findUnique({ where: { id: userId } });

        if(!user) throw new NotFoundException('User not found');

        return this.prisma.user.update({
            where: { id: userId },
            data: { isActive: !user.isActive },
            select: { id: true, username: true, isActive: true }
        })
    }

    // UPDATE ROLE
    async updateRole(userId: string, role: string){
        const user = this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new NotFoundException('User not found');

        return this.prisma.user.update({
            where: { id: userId },
            data: { role: role as any },
            select: { id: true, username: true, role: true },
        });
    }

    // DELETE POST
    async deletePost(postId: string){
        const post = await this.prisma.post.findUnique({ where: { id: postId } });
        if(!post) throw new NotFoundException('Post not found');

        await this.prisma.post.delete({ where: { id: post.id } });
        return { message: 'Post deleted' };
    }
}
