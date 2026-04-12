import { Injectable } from '@nestjs/common';
import { NotifType } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class NotificationsService {
    constructor(private prisma: PrismaService){}

    // GET NOTIFICATIONS
    async getNotifications(userId: string){
        return this.prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 50, 
        });
    };

    // MARK ALL AS READ
    async markAllRead(userId: string) {
        await this.prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
        });

        return { message: 'All notifications marked as read' };
    };

    // MARK ONE AS READ
    async markOneRead(notifId: string, userId: string){
        await this.prisma.notification.updateMany({
            where: { id: notifId, userId },
            data: { isRead: true },
        });

        return { message: 'Notification marked as read' };
    }

    // CREATE NOTIFICATION
    async create(userId: string, type: NotifType, message: string, refId: string){
        return this.prisma.notification.create({
            data: { userId, type, message, refId },
        });
    };
}
