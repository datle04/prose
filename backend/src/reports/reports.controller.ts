import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Role, ReportStatus } from '@prisma/client';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
    constructor(private reportsService: ReportsService) {}

    @Post()
    create(@CurrentUser() user: any, @Body() dto: CreateReportDto) {
        return this.reportsService.create(user.id, dto);
    }

    @Get()
    @UseGuards(RolesGuard)
    @Roles(Role.ADMIN)
    findAll(@Query('status') status?: ReportStatus) {
        return this.reportsService.findAll(status);
    }

    @Patch(':id/status')
    @UseGuards(RolesGuard)
    @Roles(Role.ADMIN)
    updateStatus(@Param('id') id: string, @Body('status') status: ReportStatus) {
        return this.reportsService.updateStatus(id, status);
    }
}
