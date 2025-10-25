import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, IsOptional, IsObject } from 'class-validator';
import { QREventType } from '@prisma/client';

export class CreateQREventDto {
  @ApiProperty({
    description: 'Código QR de la muestra',
    example: 'QR-2025-000001',
  })
  @IsString()
  @IsNotEmpty()
  codigoQR: string;

  @ApiProperty({
    description: 'Tipo de evento',
    enum: QREventType,
    example: QREventType.SCANNED,
  })
  @IsEnum(QREventType)
  @IsNotEmpty()
  tipoEvento: QREventType;

  @ApiProperty({
    description: 'ID del usuario que registra el evento',
    example: 'uuid-del-usuario',
  })
  @IsString()
  @IsNotEmpty()
  usuarioId: string;

  @ApiProperty({
    description: 'Ubicación física donde ocurre el evento',
    example: 'Laboratorio Principal - Planta 1',
    required: false,
  })
  @IsString()
  @IsOptional()
  ubicacion?: string;

  @ApiProperty({
    description: 'Metadata adicional en formato JSON',
    example: { temperatura: '25°C', humedad: '60%' },
    required: false,
  })
  @IsObject()
  @IsOptional()
  metadataJson?: Record<string, any>;
}
