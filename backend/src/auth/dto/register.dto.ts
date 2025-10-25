import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsEnum,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class RegisterDto {
  @ApiProperty({ example: 'nuevo.usuario@cmpc.cl' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'SecurePassword123!' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'Dr. Juan Pérez' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({
    example: 'INVESTIGADOR',
    enum: UserRole,
    default: 'INVESTIGADOR',
  })
  @IsEnum(UserRole)
  @IsOptional()
  rol?: UserRole;

  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  plantaId?: string;
}
