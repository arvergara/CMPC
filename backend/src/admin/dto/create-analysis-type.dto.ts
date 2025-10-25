import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAnalysisTypeDto {
  @ApiProperty({ example: 'Análisis de pH' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ example: 'Medición de acidez/alcalinidad', required: false })
  @IsString()
  @IsOptional()
  descripcion?: string;

  @ApiProperty({ example: 'Método ASTM D1293', required: false })
  @IsString()
  @IsOptional()
  metodo?: string;

  @ApiProperty({ example: 24, required: false })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  tiempoEstimadoHoras?: number;

  @ApiProperty({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
