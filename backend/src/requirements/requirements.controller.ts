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
import { RequirementsService } from './requirements.service';
import { CreateRequirementDto } from './dto/create-requirement.dto';
import { UpdateRequirementDto } from './dto/update-requirement.dto';
import { RequirementStatus } from '@prisma/client';

@ApiTags('Requirements')
@Controller('requirements')
export class RequirementsController {
  constructor(private readonly requirementsService: RequirementsService) {}

  /**
   * Crear un nuevo requerimiento
   */
  @Post()
  @ApiOperation({
    summary: 'Crear nuevo requerimiento',
    description:
      'Crea un nuevo requerimiento de muestras. Se genera automáticamente un código único.',
  })
  @ApiResponse({
    status: 201,
    description: 'Requerimiento creado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Investigador no encontrado',
  })
  create(@Body() createRequirementDto: CreateRequirementDto) {
    return this.requirementsService.create(createRequirementDto);
  }

  /**
   * Obtener todos los requerimientos con filtros opcionales
   */
  @Get()
  @ApiOperation({
    summary: 'Listar requerimientos',
    description:
      'Obtiene todos los requerimientos con filtros opcionales por investigador, estado y planta.',
  })
  @ApiQuery({
    name: 'investigadorId',
    required: false,
    description: 'Filtrar por ID del investigador',
  })
  @ApiQuery({
    name: 'estado',
    required: false,
    enum: RequirementStatus,
    description: 'Filtrar por estado del requerimiento',
  })
  @ApiQuery({
    name: 'plantaId',
    required: false,
    description: 'Filtrar por ID de la planta',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de requerimientos',
  })
  findAll(
    @Query('investigadorId') investigadorId?: string,
    @Query('estado') estado?: RequirementStatus,
    @Query('plantaId') plantaId?: string,
  ) {
    return this.requirementsService.findAll({
      investigadorId,
      estado,
      plantaId,
    });
  }

  /**
   * Obtener historial de requerimientos de un investigador
   */
  @Get('investigador/:investigadorId/history')
  @ApiOperation({
    summary: 'Historial del investigador',
    description: 'Obtiene todos los requerimientos de un investigador específico',
  })
  @ApiParam({
    name: 'investigadorId',
    description: 'ID del investigador',
  })
  @ApiResponse({
    status: 200,
    description: 'Historial de requerimientos del investigador',
  })
  getMyHistory(@Param('investigadorId') investigadorId: string) {
    return this.requirementsService.getMyHistory(investigadorId);
  }

  /**
   * Obtener un requerimiento por código
   */
  @Get('code/:codigo')
  @ApiOperation({
    summary: 'Buscar por código',
    description: 'Obtiene un requerimiento por su código único (REQ-YYYY-NNNNNN)',
  })
  @ApiParam({
    name: 'codigo',
    description: 'Código del requerimiento',
    example: 'REQ-2024-000001',
  })
  @ApiResponse({
    status: 200,
    description: 'Requerimiento encontrado',
  })
  @ApiResponse({
    status: 404,
    description: 'Requerimiento no encontrado',
  })
  findByCode(@Param('codigo') codigo: string) {
    return this.requirementsService.findByCode(codigo);
  }

  /**
   * Obtener un requerimiento por ID
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener requerimiento por ID',
    description:
      'Obtiene un requerimiento específico con todas sus muestras y eventos asociados',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID del requerimiento',
  })
  @ApiResponse({
    status: 200,
    description: 'Requerimiento encontrado',
  })
  @ApiResponse({
    status: 404,
    description: 'Requerimiento no encontrado',
  })
  findOne(@Param('id') id: string) {
    return this.requirementsService.findOne(id);
  }

  /**
   * Actualizar un requerimiento
   */
  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar requerimiento',
    description:
      'Actualiza un requerimiento. Solo se pueden editar campos si está en estado DRAFT, excepto el estado que puede cambiarse según las transiciones permitidas.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID del requerimiento',
  })
  @ApiResponse({
    status: 200,
    description: 'Requerimiento actualizado',
  })
  @ApiResponse({
    status: 404,
    description: 'Requerimiento no encontrado',
  })
  @ApiResponse({
    status: 403,
    description: 'No se puede editar un requerimiento que no está en estado DRAFT',
  })
  update(
    @Param('id') id: string,
    @Body() updateRequirementDto: UpdateRequirementDto,
  ) {
    return this.requirementsService.update(id, updateRequirementDto);
  }

  /**
   * Cambiar el estado de un requerimiento
   */
  @Patch(':id/status')
  @ApiOperation({
    summary: 'Cambiar estado',
    description:
      'Cambia el estado de un requerimiento validando las transiciones permitidas.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID del requerimiento',
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
    description: 'Requerimiento no encontrado',
  })
  changeStatus(
    @Param('id') id: string,
    @Body('estado') newStatus: RequirementStatus,
  ) {
    return this.requirementsService.changeStatus(id, newStatus);
  }

  /**
   * Eliminar un requerimiento (soft delete)
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Eliminar requerimiento',
    description:
      'Elimina un requerimiento (soft delete). Solo se puede eliminar si no tiene muestras asociadas.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID del requerimiento',
  })
  @ApiResponse({
    status: 200,
    description: 'Requerimiento eliminado (estado cambiado a CANCELADO)',
  })
  @ApiResponse({
    status: 400,
    description: 'No se puede eliminar un requerimiento con muestras asociadas',
  })
  @ApiResponse({
    status: 404,
    description: 'Requerimiento no encontrado',
  })
  remove(@Param('id') id: string) {
    return this.requirementsService.remove(id);
  }
}
