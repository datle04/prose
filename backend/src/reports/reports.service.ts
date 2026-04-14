import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';
import { ReportStatus } from '@prisma/client';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async create(reporterId: string, dto: CreateReportDto) {
    // Validate target tồn tại
    if (dto.type === 'POST') {
        const post = await this.prisma.post.findUnique({ where: { id: dto.targetId } });
        if (!post) throw new NotFoundException('Post not found');
    } else if (dto.type === 'COMMENT') {
        const comment = await this.prisma.comment.findUnique({ where: { id: dto.targetId } });
        if (!comment) throw new NotFoundException('Comment not found');
    }

    return this.prisma.report.create({
        data: {
            reporterId,
            type: dto.type,
            targetId: dto.targetId,
            reason: dto.reason,
            postId: dto.type === 'POST' ? dto.targetId : undefined,
            commentId: dto.type === 'COMMENT' ? dto.targetId : undefined,
        },
    });
  }


  async findAll(status?: ReportStatus) {
    return this.prisma.report.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        reporter: { select: { id: true, name: true, username: true } },
      },
    });
  }

  async updateStatus(reportId: string, status: ReportStatus) {
    return this.prisma.report.update({
      where: { id: reportId },
      data: { status },
    });
  }
}
