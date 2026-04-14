import { IsString, IsEnum } from 'class-validator';
import { ReportType } from '@prisma/client';

export class CreateReportDto {
  @IsEnum(ReportType)
  type!: ReportType;

  @IsString()
  targetId!: string;

  @IsString()
  reason!: string;
}
