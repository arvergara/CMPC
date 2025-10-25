import { PartialType } from '@nestjs/swagger';
import { CreateRequirementDto } from './create-requirement.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { RequirementStatus } from '@prisma/client';

export class UpdateRequirementDto extends PartialType(CreateRequirementDto) {
  @ApiProperty({
    description: 'Estado del requerimiento',
    enum: RequirementStatus,
    example: RequirementStatus.ENVIADO,
    required: false,
  })
  @IsEnum(RequirementStatus)
  @IsOptional()
  estado?: RequirementStatus;
}
