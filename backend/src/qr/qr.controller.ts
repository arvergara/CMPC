import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { QRService } from './qr.service';
import { CreateQREventDto } from './dto/create-qr-event.dto';
import { QREventType } from '@prisma/client';

@ApiTags('QR System')
@Controller('qr')
export class QRController {
  constructor(private readonly qrService: QRService) {}

  /**
   * Registrar un evento QR
   */
  @Post('events')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Registrar evento QR',
    description:
      'Registra un nuevo evento en el historial inmutable de una muestra mediante su código QR',
  })
  @ApiResponse({
    status: 201,
    description: 'Evento registrado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Muestra o usuario no encontrado',
  })
  createEvent(@Body() createQREventDto: CreateQREventDto) {
    return this.qrService.createEvent(createQREventDto);
  }

  /**
   * Obtener eventos recientes
   */
  @Get('events/recent')
  @ApiOperation({
    summary: 'Eventos recientes',
    description: 'Obtiene los eventos QR más recientes del sistema',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Número máximo de eventos a retornar (máx 200)',
    example: 50,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de eventos recientes',
  })
  getRecentEvents(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 50;
    return this.qrService.getRecentEvents(limitNum);
  }

  /**
   * Obtener estadísticas de eventos
   */
  @Get('events/statistics')
  @ApiOperation({
    summary: 'Estadísticas de eventos',
    description: 'Obtiene estadísticas agregadas de eventos QR por tipo',
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas de eventos',
  })
  getStatistics() {
    return this.qrService.getEventStatistics();
  }

  /**
   * Obtener eventos por tipo
   */
  @Get('events/type/:tipo')
  @ApiOperation({
    summary: 'Eventos por tipo',
    description: 'Obtiene todos los eventos de un tipo específico',
  })
  @ApiParam({
    name: 'tipo',
    description: 'Tipo de evento QR',
    enum: QREventType,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de eventos del tipo especificado',
  })
  getEventsByType(@Param('tipo') tipo: QREventType) {
    return this.qrService.getEventsByType(tipo);
  }

  /**
   * Buscar eventos por ubicación
   */
  @Get('events/location/:ubicacion')
  @ApiOperation({
    summary: 'Buscar por ubicación',
    description: 'Busca eventos QR por ubicación física',
  })
  @ApiParam({
    name: 'ubicacion',
    description: 'Ubicación a buscar',
    example: 'Laboratorio Principal',
  })
  @ApiResponse({
    status: 200,
    description: 'Eventos en la ubicación especificada',
  })
  searchByLocation(@Param('ubicacion') ubicacion: string) {
    return this.qrService.searchByLocation(ubicacion);
  }

  /**
   * Obtener historial de eventos por código QR
   */
  @Get(':codigoQR/events')
  @ApiOperation({
    summary: 'Historial por QR',
    description:
      'Obtiene todo el historial de eventos de una muestra mediante su código QR',
  })
  @ApiParam({
    name: 'codigoQR',
    description: 'Código QR de la muestra',
    example: 'QR-2025-000001',
  })
  @ApiResponse({
    status: 200,
    description: 'Historial de eventos de la muestra',
  })
  @ApiResponse({
    status: 404,
    description: 'Muestra no encontrada',
  })
  getEventsByQR(@Param('codigoQR') codigoQR: string) {
    return this.qrService.getEventsByQR(codigoQR);
  }

  /**
   * Obtener timeline de una muestra
   */
  @Get('samples/:sampleId/timeline')
  @ApiOperation({
    summary: 'Timeline de muestra',
    description:
      'Obtiene la línea de tiempo completa de eventos de una muestra ordenados cronológicamente',
  })
  @ApiParam({
    name: 'sampleId',
    description: 'ID de la muestra',
  })
  @ApiResponse({
    status: 200,
    description: 'Timeline de eventos',
  })
  @ApiResponse({
    status: 404,
    description: 'Muestra no encontrada',
  })
  getTimeline(@Param('sampleId') sampleId: string) {
    return this.qrService.getTimeline(sampleId);
  }
}
