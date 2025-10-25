import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsInt,
  Min,
  IsArray,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class CreateRequirementDto {
  @ApiProperty({
    description: 'ID del investigador que solicita',
    example: 'uuid-del-investigador',
  })
  @IsUUID()
  @IsNotEmpty()
  investigadorId: string;

  @ApiProperty({
    description: 'Tipo de muestra solicitada',
    example: 'Pulpa de celulosa',
  })
  @IsString()
  @IsNotEmpty()
  tipoMuestra: string;

  @ApiProperty({
    description: 'Cantidad de muestras esperadas',
    example: 5,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  cantidadEsperada: number;

  @ApiProperty({
    description: 'Descripción del requerimiento',
    example: 'Análisis de resistencia para lote 2024-Q1',
    required: false,
  })
  @IsString()
  @IsOptional()
  descripcion?: string;

  @ApiProperty({
    description: 'URLs de documentos adjuntos',
    example: ['https://storage.cmpc.cl/docs/spec-2024.pdf'],
    required: false,
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  documentosAdjuntos?: string[];

  @ApiProperty({
    description: 'ID de la planta (opcional)',
    example: 'uuid-de-planta',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  plantaId?: string;

  @ApiProperty({
    description: 'ID del laboratorio asignado (opcional)',
    example: 'uuid-de-laboratorio',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  laboratorioAsignadoId?: string;
}
