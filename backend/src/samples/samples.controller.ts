import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  Res,
  StreamableFile,
  Header,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { Response } from 'express';
import { SamplesService } from './samples.service';
import { CreateSampleDto } from './dto/create-sample.dto';
import { UpdateSampleDto } from './dto/update-sample.dto';
import { SampleStatus } from '@prisma/client';

@ApiTags('Samples')
@Controller('samples')
export class SamplesController {
  constructor(private readonly samplesService: SamplesService) {}

  /**
   * Crear una nueva muestra
   */
  @Post()
  @ApiOperation({
    summary: 'Crear nueva muestra',
    description:
      'Crea una nueva muestra asociada a un requerimiento. Se genera automáticamente un código QR único.',
  })
  @ApiResponse({
    status: 201,
    description: 'Muestra creada exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Requerimiento no encontrado',
  })
  create(@Body() createSampleDto: CreateSampleDto) {
    return this.samplesService.create(createSampleDto);
  }

  /**
   * Obtener todas las muestras con filtros opcionales
   */
  @Get()
  @ApiOperation({
    summary: 'Listar muestras',
    description:
      'Obtiene todas las muestras con filtros opcionales por requerimiento, estado y código QR.',
  })
  @ApiQuery({
    name: 'requirementId',
    required: false,
    description: 'Filtrar por ID del requerimiento',
  })
  @ApiQuery({
    name: 'estado',
    required: false,
    enum: SampleStatus,
    description: 'Filtrar por estado de la muestra',
  })
  @ApiQuery({
    name: 'codigoQR',
    required: false,
    description: 'Buscar por código QR (búsqueda parcial)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de muestras',
  })
  findAll(
    @Query('requirementId') requirementId?: string,
    @Query('estado') estado?: SampleStatus,
    @Query('codigoQR') codigoQR?: string,
  ) {
    return this.samplesService.findAll({
      requirementId,
      estado,
      codigoQR,
    });
  }

  /**
   * Obtener una muestra por código QR
   */
  @Get('qr/:codigoQR')
  @ApiOperation({
    summary: 'Buscar por código QR',
    description:
      'Obtiene una muestra por su código QR único. Incluye historial de eventos.',
  })
  @ApiParam({
    name: 'codigoQR',
    description: 'Código QR de la muestra',
    example: 'QR-2025-000001',
  })
  @ApiResponse({
    status: 200,
    description: 'Muestra encontrada',
  })
  @ApiResponse({
    status: 404,
    description: 'Muestra no encontrada',
  })
  findByQRCode(@Param('codigoQR') codigoQR: string) {
    return this.samplesService.findByQRCode(codigoQR);
  }

  /**
   * Obtener historial completo de una muestra
   */
  @Get(':id/history')
  @ApiOperation({
    summary: 'Obtener historial de muestra',
    description:
      'Obtiene el historial completo de eventos y análisis de una muestra',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID de la muestra',
  })
  @ApiResponse({
    status: 200,
    description: 'Historial de la muestra',
  })
  @ApiResponse({
    status: 404,
    description: 'Muestra no encontrada',
  })
  getHistory(@Param('id') id: string) {
    return this.samplesService.getHistory(id);
  }

  /**
   * Obtener una muestra por ID
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener muestra por ID',
    description:
      'Obtiene una muestra específica con todos sus detalles, incluyendo requerimiento, análisis y eventos.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID de la muestra',
  })
  @ApiResponse({
    status: 200,
    description: 'Muestra encontrada',
  })
  @ApiResponse({
    status: 404,
    description: 'Muestra no encontrada',
  })
  findOne(@Param('id') id: string) {
    return this.samplesService.findOne(id);
  }

  /**
   * Actualizar una muestra
   */
  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar muestra',
    description: 'Actualiza los datos de una muestra',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID de la muestra',
  })
  @ApiResponse({
    status: 200,
    description: 'Muestra actualizada',
  })
  @ApiResponse({
    status: 404,
    description: 'Muestra no encontrada',
  })
  @ApiResponse({
    status: 400,
    description: 'No se puede editar una muestra eliminada',
  })
  update(@Param('id') id: string, @Body() updateSampleDto: UpdateSampleDto) {
    return this.samplesService.update(id, updateSampleDto);
  }

  /**
   * Cambiar el estado de una muestra
   */
  @Patch(':id/status')
  @ApiOperation({
    summary: 'Cambiar estado',
    description:
      'Cambia el estado de una muestra validando las transiciones permitidas. Actualiza automáticamente las fechas correspondientes.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID de la muestra',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        estado: {
          type: 'string',
          enum: Object.values(SampleStatus),
          example: SampleStatus.RECIBIDA,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Estado actualizado',
  })
  @ApiResponse({
    status: 400,
    description: 'Transición de estado no válida',
  })
  @ApiResponse({
    status: 404,
    description: 'Muestra no encontrada',
  })
  changeStatus(
    @Param('id') id: string,
    @Body('estado') newStatus: SampleStatus,
  ) {
    return this.samplesService.changeStatus(id, newStatus);
  }

  /**
   * Recibir muestra
   */
  @Post(':id/receive')
  @ApiOperation({
    summary: 'Recibir muestra',
    description:
      'Marca una muestra como recibida y registra la fecha de recepción',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID de la muestra',
  })
  @ApiBody({
    required: false,
    schema: {
      type: 'object',
      properties: {
        observaciones: {
          type: 'string',
          example: 'Muestra recibida en buen estado',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Muestra recibida',
  })
  @ApiResponse({
    status: 404,
    description: 'Muestra no encontrada',
  })
  receiveSample(
    @Param('id') id: string,
    @Body('observaciones') observaciones?: string,
  ) {
    return this.samplesService.receiveSample(id, observaciones);
  }

  /**
   * Crear submuestra o contramuestra
   */
  @Post(':id/derivative')
  @ApiOperation({
    summary: 'Crear muestra derivada',
    description:
      'Crea una submuestra o contramuestra a partir de una muestra existente',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID de la muestra padre',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        tipo: { type: 'string', example: 'Pulpa de celulosa' },
        formato: { type: 'string', example: 'Hoja' },
        cantidad: { type: 'string', example: '100g' },
        esContramuestra: { type: 'boolean', example: false },
        observaciones: { type: 'string', example: 'Submuestra para análisis' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Muestra derivada creada',
  })
  @ApiResponse({
    status: 404,
    description: 'Muestra padre no encontrada',
  })
  createDerivativeSample(
    @Param('id') parentSampleId: string,
    @Body() createDto: Partial<CreateSampleDto>,
  ) {
    return this.samplesService.createDerivativeSample(parentSampleId, createDto);
  }

  /**
   * Generar imagen QR de una muestra
   */
  @Get(':id/qr-image')
  @Header('Content-Type', 'image/png')
  @ApiOperation({
    summary: 'Generar imagen QR',
    description:
      'Genera y retorna la imagen QR de una muestra en formato PNG, SVG o Data URL',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID de la muestra',
  })
  @ApiQuery({
    name: 'format',
    required: false,
    enum: ['png', 'svg', 'dataURL'],
    description: 'Formato de la imagen (png, svg, dataURL)',
  })
  @ApiResponse({
    status: 200,
    description: 'Imagen QR generada',
  })
  @ApiResponse({
    status: 404,
    description: 'Muestra no encontrada',
  })
  async generateQRImage(
    @Param('id') id: string,
    @Query('format') format: 'png' | 'svg' | 'dataURL' = 'png',
    @Res({ passthrough: true }) res: Response,
  ) {
    const qrImage = await this.samplesService.generateQRImage(id, format);

    if (format === 'png') {
      res.set({
        'Content-Type': 'image/png',
        'Content-Disposition': `inline; filename="qr-${id}.png"`,
      });
      return new StreamableFile(qrImage as Buffer);
    } else if (format === 'svg') {
      res.set({
        'Content-Type': 'image/svg+xml',
        'Content-Disposition': `inline; filename="qr-${id}.svg"`,
      });
      return qrImage;
    } else {
      // dataURL
      res.set({
        'Content-Type': 'text/plain',
      });
      return { dataURL: qrImage };
    }
  }

  /**
   * Eliminar una muestra (soft delete)
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Eliminar muestra',
    description:
      'Elimina una muestra (soft delete). No se puede eliminar si tiene análisis en progreso.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID de la muestra',
  })
  @ApiResponse({
    status: 200,
    description: 'Muestra eliminada (estado cambiado a ELIMINADA)',
  })
  @ApiResponse({
    status: 400,
    description: 'No se puede eliminar una muestra con análisis en progreso',
  })
  @ApiResponse({
    status: 404,
    description: 'Muestra no encontrada',
  })
  remove(@Param('id') id: string) {
    return this.samplesService.remove(id);
  }
}
