import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsUUID,
} from 'class-validator';

export class CreateStorageDto {
  @ApiProperty({
    description: 'ID de la muestra a almacenar',
    example: 'uuid-de-muestra',
  })
  @IsUUID()
  @IsNotEmpty()
  sampleId: string;

  @ApiProperty({
    description: 'Ubicación física en la bodega',
    example: 'Bodega Principal',
  })
  @IsString()
  @IsNotEmpty()
  ubicacionFisica: string;

  @ApiProperty({
    description: 'Código de estantería',
    example: 'EST-A-01',
  })
  @IsString()
  @IsNotEmpty()
  estanteria: string;

  @ApiProperty({
    description: 'Código de caja (opcional)',
    example: 'CAJA-123',
    required: false,
  })
  @IsString()
  @IsOptional()
  caja?: string;

  @ApiProperty({
    description: 'Posición dentro de la caja (opcional)',
    example: 'A1',
    required: false,
  })
  @IsString()
  @IsOptional()
  posicion?: string;

  @ApiProperty({
    description: 'Fecha estimada de vencimiento (opcional)',
    example: '2026-12-31',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  fechaVencimientoEstimada?: string;
}
