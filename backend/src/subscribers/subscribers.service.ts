import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SubscribeDto } from './dto/subscribe.dto';

@Injectable()
export class SubscribersService {
    constructor(private prisma: PrismaService) {}

    async subscribe(dto: SubscribeDto, userId?: string) {
        const existing = await this.prisma.subscriber.findUnique({
            where: { email: dto.email },
        });

        if (existing) throw new ConflictException('Email already subscribed');

        return this.prisma.subscriber.create({
            data: { email: dto.email, userId },
        });
    }

    async unsubscribe(email: string) {
        const existing = await this.prisma.subscriber.findUnique({
            where: { email },
        });

        if (!existing) throw new NotFoundException('Email not found');

        await this.prisma.subscriber.delete({ where: { email } });
        return { message: 'Unsubscribed successfully' };
    }
}
