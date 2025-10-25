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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { StorageService } from './storage.service';
import { CreateStorageDto } from './dto/create-storage.dto';
import { UpdateStorageDto } from './dto/update-storage.dto';
import { StorageStatus } from '@prisma/client';

@ApiTags('Storage')
@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  /**
   * Almacenar una muestra en bodega
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Almacenar muestra',
    description: 'Registra una muestra en el sistema de almacenamiento',
  })
  @ApiResponse({
    status: 201,
    description: 'Muestra almacenada exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Muestra no encontrada',
  })
  @ApiResponse({
    status: 409,
    description: 'La muestra ya está almacenada',
  })
  create(@Body() createStorageDto: CreateStorageDto) {
    return this.storageService.create(createStorageDto);
  }

  /**
   * Listar todos los almacenamientos con filtros
   */
  @Get()
  @ApiOperation({
    summary: 'Listar almacenamientos',
    description: 'Obtiene todos los registros de almacenamiento con filtros opcionales',
  })
  @ApiQuery({
    name: 'estado',
    required: false,
    enum: StorageStatus,
    description: 'Filtrar por estado',
  })
  @ApiQuery({
    name: 'ubicacionFisica',
    required: false,
    description: 'Buscar por ubicación física',
    example: 'Bodega Principal',
  })
  @ApiQuery({
    name: 'estanteria',
    required: false,
    description: 'Filtrar por estantería',
    example: 'EST-A-01',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de almacenamientos',
  })
  findAll(
    @Query('estado') estado?: StorageStatus,
    @Query('ubicacionFisica') ubicacionFisica?: string,
    @Query('estanteria') estanteria?: string,
  ) {
    return this.storageService.findAll({
      estado,
      ubicacionFisica,
      estanteria,
    });
  }

  /**
   * Obtener estadísticas de almacenamiento
   */
  @Get('statistics')
  @ApiOperation({
    summary: 'Estadísticas de almacenamiento',
    description: 'Obtiene estadísticas agregadas del sistema de almacenamiento',
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas del almacenamiento',
  })
  getStatistics() {
    return this.storageService.getStatistics();
  }

  /**
   * Obtener muestras próximas a vencer
   */
  @Get('expiring')
  @ApiOperation({
    summary: 'Muestras próximas a vencer',
    description: 'Obtiene las muestras que vencerán en los próximos N días',
  })
  @ApiQuery({
    name: 'days',
    required: false,
    description: 'Número de días hacia el futuro',
    example: 30,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de muestras próximas a vencer',
  })
  getExpiringSoon(@Query('days') days?: string) {
    const daysNum = days ? parseInt(days, 10) : 30;
    return this.storageService.getExpiringSoon(daysNum);
  }

  /**
   * Obtener ubicaciones disponibles en una estantería
   */
  @Get('locations/:estanteria')
  @ApiOperation({
    summary: 'Ubicaciones disponibles',
    description: 'Obtiene información sobre ubicaciones disponibles en una estantería',
  })
  @ApiParam({
    name: 'estanteria',
    description: 'Código de la estantería',
    example: 'EST-A-01',
  })
  @ApiResponse({
    status: 200,
    description: 'Información de ubicaciones en la estantería',
  })
  getAvailableLocations(@Param('estanteria') estanteria: string) {
    return this.storageService.getAvailableLocations(estanteria);
  }

  /**
   * Obtener almacenamiento por ID
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener por ID',
    description: 'Obtiene un registro de almacenamiento específico',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del registro de almacenamiento',
  })
  @ApiResponse({
    status: 200,
    description: 'Registro de almacenamiento encontrado',
  })
  @ApiResponse({
    status: 404,
    description: 'Almacenamiento no encontrado',
  })
  findOne(@Param('id') id: string) {
    return this.storageService.findOne(id);
  }

  /**
   * Obtener almacenamiento por ID de muestra
   */
  @Get('sample/:sampleId')
  @ApiOperation({
    summary: 'Obtener por muestra',
    description: 'Obtiene el almacenamiento de una muestra específica',
  })
  @ApiParam({
    name: 'sampleId',
    description: 'ID de la muestra',
  })
  @ApiResponse({
    status: 200,
    description: 'Almacenamiento de la muestra',
  })
  @ApiResponse({
    status: 404,
    description: 'Almacenamiento no encontrado para la muestra',
  })
  findBySampleId(@Param('sampleId') sampleId: string) {
    return this.storageService.findBySampleId(sampleId);
  }

  /**
   * Actualizar ubicación de almacenamiento
   */
  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar almacenamiento',
    description: 'Actualiza la ubicación o estado de un almacenamiento',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del registro de almacenamiento',
  })
  @ApiResponse({
    status: 200,
    description: 'Almacenamiento actualizado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Almacenamiento no encontrado',
  })
  update(@Param('id') id: string, @Body() updateStorageDto: UpdateStorageDto) {
    return this.storageService.update(id, updateStorageDto);
  }

  /**
   * Solicitar eliminación de una muestra
   */
  @Post(':id/request-deletion')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Solicitar eliminación',
    description: 'Registra una solicitud de eliminación de muestra almacenada',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del registro de almacenamiento',
  })
  @ApiResponse({
    status: 200,
    description: 'Solicitud de eliminación registrada',
  })
  @ApiResponse({
    status: 404,
    description: 'Almacenamiento no encontrado',
  })
  @ApiResponse({
    status: 400,
    description: 'Ya existe una solicitud de eliminación pendiente',
  })
  requestDeletion(@Param('id') id: string) {
    return this.storageService.requestDeletion(id);
  }

  /**
   * Aprobar eliminación de una muestra
   */
  @Post(':id/approve-deletion')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Aprobar eliminación',
    description: 'Aprueba la eliminación de una muestra almacenada',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del registro de almacenamiento',
  })
  @ApiResponse({
    status: 200,
    description: 'Eliminación aprobada exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Almacenamiento no encontrado',
  })
  @ApiResponse({
    status: 400,
    description: 'No existe solicitud de eliminación o ya fue aprobada',
  })
  approveDeletion(@Param('id') id: string) {
    return this.storageService.approveDeletion(id);
  }

  /**
   * Eliminar registro de almacenamiento
   */
  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar almacenamiento',
    description: 'Elimina un registro de almacenamiento (requiere aprobación previa)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del registro de almacenamiento',
  })
  @ApiResponse({
    status: 200,
    description: 'Registro eliminado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Almacenamiento no encontrado',
  })
  @ApiResponse({
    status: 400,
    description: 'La eliminación debe ser aprobada primero',
  })
  remove(@Param('id') id: string) {
    return this.storageService.remove(id);
  }
}
