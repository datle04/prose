import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) {}

    async getProfile(username: string) {
        const user = await this.prisma.user.findUnique({
            where: { username },
            select: {
                id: true,
                name: true,
                username: true,
                avatar: true,
                bio: true,
                role: true,
                createdAt: true,
                _count: {
                    select: {
                        posts: true,
                        followers: true,
                        following: true,
                    },
                },
            },
        });

        if (!user) throw new NotFoundException('User not found!');
        return user;
    };

    async updateProfile(userId: string, dto: UpdateProfileDto) {
        return this.prisma.user.update({
            where: { id: userId },
            data: dto,
            select: {
                id: true,
                name: true,
                username: true,
                avatar: true,
                bio: true,
            },
        });
    };

    // TOGGLE FOLLOW
    async toggleFollow(followerId: string, username: string){
        const target = await this.prisma.user.findUnique({
            where: { username },
        });

        if(!target) throw new NotFoundException('User not found');

        if(target.id === followerId) throw new ForbiddenException('You cannot follow yourself');

        const existing = await this.prisma.follow.findUnique({
            where: {
                followerId_followingId: { followerId, followingId: target.id },
            },
        });

        if (existing) {
            await this.prisma.follow.delete({
                where: {
                    followerId_followingId: { followerId, followingId: target.id },
                },
            });

            return { followed: false };
        };

        await this.prisma.follow.create({
            data: { followerId, followingId: target.id },
        });

        return { followed: true };
    };
}
