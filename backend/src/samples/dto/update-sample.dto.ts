import { PartialType } from '@nestjs/swagger';
import { CreateSampleDto } from './create-sample.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { SampleStatus } from '@prisma/client';

export class UpdateSampleDto extends PartialType(CreateSampleDto) {
  @ApiProperty({
    description: 'Estado de la muestra',
    enum: SampleStatus,
    example: SampleStatus.RECIBIDA,
    required: false,
  })
  @IsEnum(SampleStatus)
  @IsOptional()
  estado?: SampleStatus;
}
