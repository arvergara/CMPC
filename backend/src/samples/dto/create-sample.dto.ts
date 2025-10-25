import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsBoolean,
} from 'class-validator';

export class CreateSampleDto {
  @ApiProperty({
    description: 'ID del requerimiento asociado',
    example: 'uuid-del-requerimiento',
  })
  @IsUUID()
  @IsNotEmpty()
  requirementId: string;

  @ApiProperty({
    description: 'Tipo de muestra',
    example: 'Pulpa de celulosa',
  })
  @IsString()
  @IsNotEmpty()
  tipo: string;

  @ApiProperty({
    description: 'Formato de la muestra',
    example: 'Hoja',
    required: false,
  })
  @IsString()
  @IsOptional()
  formato?: string;

  @ApiProperty({
    description: 'Cantidad de muestra',
    example: '500g',
    required: false,
  })
  @IsString()
  @IsOptional()
  cantidad?: string;

  @ApiProperty({
    description: 'ID de la muestra padre (para submuestras)',
    example: 'uuid-de-muestra-padre',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  parentSampleId?: string;

  @ApiProperty({
    description: 'Indica si es una contramuestra',
    example: false,
    default: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  esContramuestra?: boolean;

  @ApiProperty({
    description: 'Observaciones adicionales',
    example: 'Muestra recibida en buen estado',
    required: false,
  })
  @IsString()
  @IsOptional()
  observaciones?: string;
}
