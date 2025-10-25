import { PartialType } from '@nestjs/swagger';
import { CreateAnalysisDto } from './create-analysis.dto';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsObject,
  IsString,
  IsDateString,
} from 'class-validator';
import { AnalysisStatus } from '@prisma/client';

export class UpdateAnalysisDto extends PartialType(CreateAnalysisDto) {
  @ApiProperty({
    description: 'Estado del análisis',
    enum: AnalysisStatus,
    example: AnalysisStatus.EN_PROCESO,
    required: false,
  })
  @IsEnum(AnalysisStatus)
  @IsOptional()
  estado?: AnalysisStatus;

  @ApiProperty({
    description: 'Resultados del análisis en formato JSON',
    example: {
      celulosa: 45.2,
      humedad: 8.5,
      unidad: 'porcentaje',
      metodo: 'TAPPI T203',
    },
    required: false,
  })
  @IsObject()
  @IsOptional()
  resultadosJson?: any;

  @ApiProperty({
    description: 'URL del archivo PDF con el reporte',
    example: 'https://storage.cmpc.cl/reports/analysis-123.pdf',
    required: false,
  })
  @IsString()
  @IsOptional()
  archivoPdfUrl?: string;

  @ApiProperty({
    description: 'Fecha de inicio del análisis (ISO 8601)',
    example: '2025-10-25T08:00:00.000Z',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  fechaInicio?: string;

  @ApiProperty({
    description: 'Fecha de finalización del análisis (ISO 8601)',
    example: '2025-10-26T14:30:00.000Z',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  fechaFin?: string;
}
