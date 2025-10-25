import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreatePlantDto } from './dto/create-plant.dto';
import { UpdatePlantDto } from './dto/update-plant.dto';
import { CreateAnalysisTypeDto } from './dto/create-analysis-type.dto';
import { UpdateAnalysisTypeDto } from './dto/update-analysis-type.dto';

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ========== User Management ==========

  @Post('users')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear usuario',
    description: 'Crea un nuevo usuario en el sistema',
  })
  @ApiResponse({ status: 201, description: 'Usuario creado exitosamente' })
  @ApiResponse({ status: 409, description: 'Email ya está en uso' })
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.adminService.createUser(createUserDto);
  }

  @Get('users')
  @ApiOperation({
    summary: 'Listar usuarios',
    description: 'Obtiene todos los usuarios del sistema',
  })
  @ApiResponse({ status: 200, description: 'Lista de usuarios' })
  findAllUsers() {
    return this.adminService.findAllUsers();
  }

  @Get('users/:id')
  @ApiOperation({
    summary: 'Obtener usuario por ID',
    description: 'Obtiene un usuario específico',
  })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiResponse({ status: 200, description: 'Usuario encontrado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  findOneUser(@Param('id') id: string) {
    return this.adminService.findOneUser(id);
  }

  @Patch('users/:id')
  @ApiOperation({
    summary: 'Actualizar usuario',
    description: 'Actualiza la información de un usuario',
  })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiResponse({ status: 200, description: 'Usuario actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.adminService.updateUser(id, updateUserDto);
  }

  @Delete('users/:id')
  @ApiOperation({
    summary: 'Eliminar usuario',
    description: 'Desactiva un usuario (soft delete)',
  })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiResponse({ status: 200, description: 'Usuario desactivado exitosamente' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  removeUser(@Param('id') id: string) {
    return this.adminService.removeUser(id);
  }

  // ========== Plant Management ==========

  @Post('plants')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear planta',
    description: 'Crea una nueva planta en el sistema',
  })
  @ApiResponse({ status: 201, description: 'Planta creada exitosamente' })
  @ApiResponse({ status: 409, description: 'Código de planta ya está en uso' })
  createPlant(@Body() createPlantDto: CreatePlantDto) {
    return this.adminService.createPlant(createPlantDto);
  }

  @Get('plants')
  @ApiOperation({
    summary: 'Listar plantas',
    description: 'Obtiene todas las plantas del sistema',
  })
  @ApiResponse({ status: 200, description: 'Lista de plantas' })
  findAllPlants() {
    return this.adminService.findAllPlants();
  }

  @Get('plants/:id')
  @ApiOperation({
    summary: 'Obtener planta por ID',
    description: 'Obtiene una planta específica con sus usuarios',
  })
  @ApiParam({ name: 'id', description: 'ID de la planta' })
  @ApiResponse({ status: 200, description: 'Planta encontrada' })
  @ApiResponse({ status: 404, description: 'Planta no encontrada' })
  findOnePlant(@Param('id') id: string) {
    return this.adminService.findOnePlant(id);
  }

  @Patch('plants/:id')
  @ApiOperation({
    summary: 'Actualizar planta',
    description: 'Actualiza la información de una planta',
  })
  @ApiParam({ name: 'id', description: 'ID de la planta' })
  @ApiResponse({ status: 200, description: 'Planta actualizada exitosamente' })
  @ApiResponse({ status: 404, description: 'Planta no encontrada' })
  updatePlant(@Param('id') id: string, @Body() updatePlantDto: UpdatePlantDto) {
    return this.adminService.updatePlant(id, updatePlantDto);
  }

  @Delete('plants/:id')
  @ApiOperation({
    summary: 'Eliminar planta',
    description: 'Elimina una planta (debe no tener usuarios asociados)',
  })
  @ApiParam({ name: 'id', description: 'ID de la planta' })
  @ApiResponse({ status: 200, description: 'Planta eliminada exitosamente' })
  @ApiResponse({ status: 404, description: 'Planta no encontrada' })
  @ApiResponse({
    status: 400,
    description: 'Planta tiene usuarios asociados',
  })
  removePlant(@Param('id') id: string) {
    return this.adminService.removePlant(id);
  }

  // ========== Analysis Type Management ==========

  @Post('analysis-types')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear tipo de análisis',
    description: 'Crea un nuevo tipo de análisis',
  })
  @ApiResponse({
    status: 201,
    description: 'Tipo de análisis creado exitosamente',
  })
  createAnalysisType(@Body() createAnalysisTypeDto: CreateAnalysisTypeDto) {
    return this.adminService.createAnalysisType(createAnalysisTypeDto);
  }

  @Get('analysis-types')
  @ApiOperation({
    summary: 'Listar tipos de análisis',
    description: 'Obtiene todos los tipos de análisis',
  })
  @ApiResponse({ status: 200, description: 'Lista de tipos de análisis' })
  findAllAnalysisTypes() {
    return this.adminService.findAllAnalysisTypes();
  }

  @Get('analysis-types/:id')
  @ApiOperation({
    summary: 'Obtener tipo de análisis por ID',
    description: 'Obtiene un tipo de análisis específico',
  })
  @ApiParam({ name: 'id', description: 'ID del tipo de análisis' })
  @ApiResponse({ status: 200, description: 'Tipo de análisis encontrado' })
  @ApiResponse({ status: 404, description: 'Tipo de análisis no encontrado' })
  findOneAnalysisType(@Param('id') id: string) {
    return this.adminService.findOneAnalysisType(id);
  }

  @Patch('analysis-types/:id')
  @ApiOperation({
    summary: 'Actualizar tipo de análisis',
    description: 'Actualiza la información de un tipo de análisis',
  })
  @ApiParam({ name: 'id', description: 'ID del tipo de análisis' })
  @ApiResponse({
    status: 200,
    description: 'Tipo de análisis actualizado exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Tipo de análisis no encontrado' })
  updateAnalysisType(
    @Param('id') id: string,
    @Body() updateAnalysisTypeDto: UpdateAnalysisTypeDto,
  ) {
    return this.adminService.updateAnalysisType(id, updateAnalysisTypeDto);
  }

  @Delete('analysis-types/:id')
  @ApiOperation({
    summary: 'Eliminar tipo de análisis',
    description:
      'Desactiva o elimina un tipo de análisis (según análisis asociados)',
  })
  @ApiParam({ name: 'id', description: 'ID del tipo de análisis' })
  @ApiResponse({
    status: 200,
    description: 'Tipo de análisis eliminado/desactivado exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Tipo de análisis no encontrado' })
  removeAnalysisType(@Param('id') id: string) {
    return this.adminService.removeAnalysisType(id);
  }
}
