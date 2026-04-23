import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { NotificationsService } from 'src/notifications/notifications.service';

@Injectable()
export class UsersService {
    constructor(
        private prisma: PrismaService,
        private notificationsService: NotificationsService
    ) {}

    async getProfile(username: string, currentUserId?: string) {
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

        let isFollowing = false;
        if (currentUserId) {
            const follow = await this.prisma.follow.findUnique({
                where: {
                    followerId_followingId: {
                        followerId: currentUserId,
                        followingId: user.id,
                    },
                },
            });
            isFollowing = !!follow;
        }

        return { ...user, isFollowing };
    }


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

        // Gọi n8n webhook
        const webhookUrl = process.env.N8N_FOLLOW_WEBHOOK_URL;
        if (webhookUrl) {
            await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                recipientEmail: target.email,
                message: `${target.name}, you have a new follower!`,
                }),
            }).catch((err) => console.error('n8n webhook error:', err));
        }

        // Create Notification
        await this.notificationsService.create(
            target.id,
            'FOLLOW',
            `Someone started following you`,
            followerId,
        )

        return { followed: true };
    };
}
