import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty({ example: 'usuario@cmpc.cl' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'Juan Pérez' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ enum: UserRole, example: UserRole.INVESTIGADOR })
  @IsEnum(UserRole)
  @IsNotEmpty()
  rol: UserRole;

  @ApiProperty({ example: 'uuid-planta', required: false })
  @IsUUID()
  @IsOptional()
  plantaId?: string;
}
