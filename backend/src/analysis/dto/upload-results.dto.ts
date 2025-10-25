import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString, IsUrl } from 'class-validator';

export class UploadResultsDto {
  @ApiProperty({
    description: 'Resultados del análisis en formato JSON',
    example: {
      ph: 7.2,
      temperatura: 25.5,
      conductividad: 1200,
      turbiedad: 5.3,
    },
  })
  @IsObject()
  resultadosJson: Record<string, any>;

  @ApiProperty({
    description: 'URL del archivo PDF con el reporte completo (opcional)',
    example: 'https://storage.example.com/reports/analysis-123.pdf',
    required: false,
  })
  @IsUrl()
  @IsOptional()
  archivoPdfUrl?: string;

  @ApiProperty({
    description: 'Observaciones sobre los resultados (opcional)',
    example: 'Valores dentro del rango esperado',
    required: false,
  })
  @IsString()
  @IsOptional()
  observaciones?: string;
}
