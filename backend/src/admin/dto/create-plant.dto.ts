import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePlantDto {
  @ApiProperty({ example: 'Planta Laja' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ example: 'LAJA' })
  @IsString()
  @IsNotEmpty()
  codigo: string;

  @ApiProperty({ example: 'Laja, Biobío, Chile' })
  @IsString()
  @IsNotEmpty()
  ubicacion: string;
}
