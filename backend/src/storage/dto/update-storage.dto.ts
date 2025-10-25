import { PartialType } from '@nestjs/swagger';
import { CreateStorageDto } from './create-storage.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { StorageStatus } from '@prisma/client';

export class UpdateStorageDto extends PartialType(CreateStorageDto) {
  @ApiProperty({
    description: 'Estado del almacenamiento',
    enum: StorageStatus,
    example: StorageStatus.OCUPADA,
    required: false,
  })
  @IsEnum(StorageStatus)
  @IsOptional()
  estado?: StorageStatus;
}
