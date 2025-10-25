import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
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
  ApiBody,
} from '@nestjs/swagger';
import { AnalysisService } from './analysis.service';
import { CreateAnalysisDto } from './dto/create-analysis.dto';
import { UpdateAnalysisDto } from './dto/update-analysis.dto';
import { UploadResultsDto } from './dto/upload-results.dto';
import { AnalysisStatus } from '@prisma/client';

@ApiTags('Analysis')
@Controller('analysis')
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  /**
   * Crear un nuevo análisis
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear análisis',
    description: 'Crea un nuevo análisis para una muestra',
  })
  @ApiResponse({
    status: 201,
    description: 'Análisis creado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Muestra o tipo de análisis no encontrado',
  })
  @ApiResponse({
    status: 400,
    description: 'El tipo de análisis no está activo',
  })
  create(@Body() createAnalysisDto: CreateAnalysisDto) {
    return this.analysisService.create(createAnalysisDto);
  }

  /**
   * Listar todos los análisis con filtros
   */
  @Get()
  @ApiOperation({
    summary: 'Listar análisis',
    description: 'Obtiene todos los análisis con filtros opcionales',
  })
  @ApiQuery({
    name: 'estado',
    required: false,
    enum: AnalysisStatus,
    description: 'Filtrar por estado',
  })
  @ApiQuery({
    name: 'sampleId',
    required: false,
    description: 'Filtrar por ID de muestra',
  })
  @ApiQuery({
    name: 'responsableId',
    required: false,
    description: 'Filtrar por ID de responsable',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de análisis',
  })
  findAll(
    @Query('estado') estado?: AnalysisStatus,
    @Query('sampleId') sampleId?: string,
    @Query('responsableId') responsableId?: string,
  ) {
    return this.analysisService.findAll({
      estado,
      sampleId,
      responsableId,
    });
  }

  /**
   * Obtener estadísticas de análisis
   */
  @Get('statistics')
  @ApiOperation({
    summary: 'Estadísticas de análisis',
    description: 'Obtiene estadísticas agregadas de los análisis',
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas de análisis',
  })
  getStatistics() {
    return this.analysisService.getStatistics();
  }

  /**
   * Obtener análisis por estado
   */
  @Get('status/:estado')
  @ApiOperation({
    summary: 'Análisis por estado',
    description: 'Obtiene todos los análisis en un estado específico',
  })
  @ApiParam({
    name: 'estado',
    description: 'Estado del análisis',
    enum: AnalysisStatus,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de análisis en el estado especificado',
  })
  getByStatus(@Param('estado') estado: AnalysisStatus) {
    return this.analysisService.getByStatus(estado);
  }

  /**
   * Obtener análisis por ID
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener análisis por ID',
    description: 'Obtiene un análisis específico con toda su información',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del análisis',
  })
  @ApiResponse({
    status: 200,
    description: 'Análisis encontrado',
  })
  @ApiResponse({
    status: 404,
    description: 'Análisis no encontrado',
  })
  findOne(@Param('id') id: string) {
    return this.analysisService.findOne(id);
  }

  /**
   * Obtener análisis por muestra
   */
  @Get('sample/:sampleId')
  @ApiOperation({
    summary: 'Análisis por muestra',
    description: 'Obtiene todos los análisis de una muestra específica',
  })
  @ApiParam({
    name: 'sampleId',
    description: 'ID de la muestra',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de análisis de la muestra',
  })
  @ApiResponse({
    status: 404,
    description: 'Muestra no encontrada',
  })
  findBySampleId(@Param('sampleId') sampleId: string) {
    return this.analysisService.findBySampleId(sampleId);
  }

  /**
   * Actualizar análisis
   */
  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar análisis',
    description: 'Actualiza la información de un análisis',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del análisis',
  })
  @ApiResponse({
    status: 200,
    description: 'Análisis actualizado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Análisis no encontrado',
  })
  update(@Param('id') id: string, @Body() updateAnalysisDto: UpdateAnalysisDto) {
    return this.analysisService.update(id, updateAnalysisDto);
  }

  /**
   * Iniciar un análisis
   */
  @Post(':id/start')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Iniciar análisis',
    description: 'Cambia el estado del análisis a EN_PROCESO',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del análisis',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        responsableId: {
          type: 'string',
          description: 'ID del responsable (opcional)',
          example: 'uuid-usuario',
        },
      },
    },
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Análisis iniciado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Análisis no encontrado',
  })
  @ApiResponse({
    status: 400,
    description: 'El análisis debe estar en estado PENDIENTE',
  })
  start(@Param('id') id: string, @Body() body?: { responsableId?: string }) {
    return this.analysisService.start(id, body?.responsableId);
  }

  /**
   * Completar un análisis
   */
  @Post(':id/complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Completar análisis',
    description: 'Marca el análisis como COMPLETADO y opcionalmente carga resultados',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del análisis',
  })
  @ApiResponse({
    status: 200,
    description: 'Análisis completado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Análisis no encontrado',
  })
  @ApiResponse({
    status: 400,
    description: 'El análisis debe estar EN_PROCESO',
  })
  complete(
    @Param('id') id: string,
    @Body() uploadResultsDto?: UploadResultsDto,
  ) {
    return this.analysisService.complete(id, uploadResultsDto);
  }

  /**
   * Cancelar un análisis
   */
  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cancelar análisis',
    description: 'Marca el análisis como CANCELADO',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del análisis',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        motivo: {
          type: 'string',
          description: 'Motivo de la cancelación (opcional)',
          example: 'Muestra deteriorada',
        },
      },
    },
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Análisis cancelado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Análisis no encontrado',
  })
  @ApiResponse({
    status: 400,
    description: 'No se puede cancelar un análisis completado',
  })
  cancel(@Param('id') id: string, @Body() body?: { motivo?: string }) {
    return this.analysisService.cancel(id, body?.motivo);
  }

  /**
   * Subir resultados de análisis
   */
  @Post(':id/results')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Subir resultados',
    description: 'Carga los resultados de un análisis (JSON y/o PDF)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del análisis',
  })
  @ApiResponse({
    status: 200,
    description: 'Resultados cargados exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Análisis no encontrado',
  })
  @ApiResponse({
    status: 400,
    description: 'No se pueden subir resultados a un análisis cancelado',
  })
  uploadResults(
    @Param('id') id: string,
    @Body() uploadResultsDto: UploadResultsDto,
  ) {
    return this.analysisService.uploadResults(id, uploadResultsDto);
  }
}
