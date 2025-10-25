import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateAnalysisDto {
  @ApiProperty({
    description: 'ID de la muestra a analizar',
    example: 'uuid-de-muestra',
  })
  @IsUUID()
  @IsNotEmpty()
  sampleId: string;

  @ApiProperty({
    description: 'ID del tipo de análisis a realizar',
    example: 'uuid-tipo-analisis',
  })
  @IsUUID()
  @IsNotEmpty()
  tipoAnalisisId: string;

  @ApiProperty({
    description: 'ID del responsable del análisis (opcional)',
    example: 'uuid-usuario',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  responsableId?: string;

  @ApiProperty({
    description: 'Observaciones adicionales (opcional)',
    example: 'Prioridad alta - cliente urgente',
    required: false,
  })
  @IsString()
  @IsOptional()
  observaciones?: string;
}
