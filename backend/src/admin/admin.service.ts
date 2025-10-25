import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreatePlantDto } from './dto/create-plant.dto';
import { UpdatePlantDto } from './dto/update-plant.dto';
import { CreateAnalysisTypeDto } from './dto/create-analysis-type.dto';
import { UpdateAnalysisTypeDto } from './dto/update-analysis-type.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  // ========== User Management ==========

  /**
   * Crea un nuevo usuario
   */
  async createUser(createUserDto: CreateUserDto) {
    // Verificar que el email no esté en uso
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('El email ya está en uso');
    }

    // Verificar que la planta existe si se proporciona
    if (createUserDto.plantaId) {
      const plant = await this.prisma.planta.findUnique({
        where: { id: createUserDto.plantaId },
      });

      if (!plant) {
        throw new NotFoundException('Planta no encontrada');
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: createUserDto.email,
        passwordHash: hashedPassword,
        nombre: createUserDto.nombre,
        rol: createUserDto.rol,
        plantaId: createUserDto.plantaId,
      },
      select: {
        id: true,
        email: true,
        nombre: true,
        rol: true,
        plantaId: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  /**
   * Obtiene todos los usuarios
   */
  async findAllUsers() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        nombre: true,
        rol: true,
        plantaId: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        planta: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return users;
  }

  /**
   * Obtiene un usuario por ID
   */
  async findOneUser(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        nombre: true,
        rol: true,
        plantaId: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        planta: {
          select: {
            id: true,
            nombre: true,
            codigo: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return user;
  }

  /**
   * Actualiza un usuario
   */
  async updateUser(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    // Verificar email si se actualiza
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });

      if (existingUser) {
        throw new ConflictException('El email ya está en uso');
      }
    }

    // Verificar planta si se actualiza
    if (updateUserDto.plantaId) {
      const plant = await this.prisma.planta.findUnique({
        where: { id: updateUserDto.plantaId },
      });

      if (!plant) {
        throw new NotFoundException('Planta no encontrada');
      }
    }

    const dataToUpdate: any = {
      email: updateUserDto.email,
      nombre: updateUserDto.nombre,
      rol: updateUserDto.rol,
      plantaId: updateUserDto.plantaId,
      isActive: updateUserDto.isActive,
    };

    // Hash password si se actualiza
    if (updateUserDto.password) {
      dataToUpdate.passwordHash = await bcrypt.hash(updateUserDto.password, 10);
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: dataToUpdate,
      select: {
        id: true,
        email: true,
        nombre: true,
        rol: true,
        plantaId: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updated;
  }

  /**
   * Elimina un usuario (soft delete)
   */
  async removeUser(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    // Soft delete - desactivar usuario
    const deleted = await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
      select: {
        id: true,
        email: true,
        nombre: true,
        isActive: true,
      },
    });

    return deleted;
  }

  // ========== Plant Management ==========

  /**
   * Crea una nueva planta
   */
  async createPlant(createPlantDto: CreatePlantDto) {
    // Verificar que el código no esté en uso si se proporciona
    if (createPlantDto.codigo) {
      const existingPlant = await this.prisma.planta.findUnique({
        where: { codigo: createPlantDto.codigo },
      });

      if (existingPlant) {
        throw new ConflictException('El código de planta ya está en uso');
      }
    }

    const plant = await this.prisma.planta.create({
      data: {
        nombre: createPlantDto.nombre,
        codigo: createPlantDto.codigo,
        ubicacion: createPlantDto.ubicacion,
      },
    });

    return plant;
  }

  /**
   * Obtiene todas las plantas
   */
  async findAllPlants() {
    const plants = await this.prisma.planta.findMany({
      include: {
        _count: {
          select: {
            users: true,
          },
        },
      },
      orderBy: {
        nombre: 'asc',
      },
    });

    return plants;
  }

  /**
   * Obtiene una planta por ID
   */
  async findOnePlant(id: string) {
    const plant = await this.prisma.planta.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            nombre: true,
            email: true,
            rol: true,
            isActive: true,
          },
        },
      },
    });

    if (!plant) {
      throw new NotFoundException(`Planta con ID ${id} no encontrada`);
    }

    return plant;
  }

  /**
   * Actualiza una planta
   */
  async updatePlant(id: string, updatePlantDto: UpdatePlantDto) {
    const plant = await this.prisma.planta.findUnique({
      where: { id },
    });

    if (!plant) {
      throw new NotFoundException(`Planta con ID ${id} no encontrada`);
    }

    // Verificar código si se actualiza
    if (updatePlantDto.codigo && updatePlantDto.codigo !== plant.codigo) {
      const existingPlant = await this.prisma.planta.findUnique({
        where: { codigo: updatePlantDto.codigo },
      });

      if (existingPlant) {
        throw new ConflictException('El código de planta ya está en uso');
      }
    }

    const updated = await this.prisma.planta.update({
      where: { id },
      data: {
        nombre: updatePlantDto.nombre,
        codigo: updatePlantDto.codigo,
        ubicacion: updatePlantDto.ubicacion,
      },
    });

    return updated;
  }

  /**
   * Elimina una planta
   */
  async removePlant(id: string) {
    const plant = await this.prisma.planta.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
          },
        },
      },
    });

    if (!plant) {
      throw new NotFoundException(`Planta con ID ${id} no encontrada`);
    }

    // Verificar que no tenga usuarios asociados
    if (plant._count.users > 0) {
      throw new BadRequestException(
        'No se puede eliminar una planta con usuarios asociados',
      );
    }

    await this.prisma.planta.delete({
      where: { id },
    });

    return { message: 'Planta eliminada exitosamente' };
  }

  // ========== Analysis Type Management ==========

  /**
   * Crea un nuevo tipo de análisis
   */
  async createAnalysisType(createAnalysisTypeDto: CreateAnalysisTypeDto) {
    const dataToCreate: any = {
      nombre: createAnalysisTypeDto.nombre,
      descripcion: createAnalysisTypeDto.descripcion,
      metodo: createAnalysisTypeDto.metodo,
      isActive: createAnalysisTypeDto.isActive ?? true,
    };

    if (createAnalysisTypeDto.tiempoEstimadoHoras !== undefined) {
      dataToCreate.tiempoEstimadoHoras = createAnalysisTypeDto.tiempoEstimadoHoras;
    }

    const analysisType = await this.prisma.analysisType.create({
      data: dataToCreate,
    });

    return analysisType;
  }

  /**
   * Obtiene todos los tipos de análisis
   */
  async findAllAnalysisTypes() {
    const analysisTypes = await this.prisma.analysisType.findMany({
      include: {
        _count: {
          select: {
            analysis: true,
          },
        },
      },
      orderBy: {
        nombre: 'asc',
      },
    });

    return analysisTypes;
  }

  /**
   * Obtiene un tipo de análisis por ID
   */
  async findOneAnalysisType(id: string) {
    const analysisType = await this.prisma.analysisType.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            analysis: true,
          },
        },
      },
    });

    if (!analysisType) {
      throw new NotFoundException(
        `Tipo de análisis con ID ${id} no encontrado`,
      );
    }

    return analysisType;
  }

  /**
   * Actualiza un tipo de análisis
   */
  async updateAnalysisType(
    id: string,
    updateAnalysisTypeDto: UpdateAnalysisTypeDto,
  ) {
    const analysisType = await this.prisma.analysisType.findUnique({
      where: { id },
    });

    if (!analysisType) {
      throw new NotFoundException(
        `Tipo de análisis con ID ${id} no encontrado`,
      );
    }

    const updated = await this.prisma.analysisType.update({
      where: { id },
      data: {
        nombre: updateAnalysisTypeDto.nombre,
        descripcion: updateAnalysisTypeDto.descripcion,
        metodo: updateAnalysisTypeDto.metodo,
        tiempoEstimadoHoras: updateAnalysisTypeDto.tiempoEstimadoHoras,
        isActive: updateAnalysisTypeDto.isActive,
      },
    });

    return updated;
  }

  /**
   * Elimina un tipo de análisis (soft delete)
   */
  async removeAnalysisType(id: string) {
    const analysisType = await this.prisma.analysisType.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            analysis: true,
          },
        },
      },
    });

    if (!analysisType) {
      throw new NotFoundException(
        `Tipo de análisis con ID ${id} no encontrado`,
      );
    }

    // Verificar si tiene análisis asociados
    if (analysisType._count.analysis > 0) {
      // Soft delete - desactivar tipo de análisis
      const deactivated = await this.prisma.analysisType.update({
        where: { id },
        data: { isActive: false },
      });

      return deactivated;
    }

    // Si no tiene análisis, se puede eliminar permanentemente
    await this.prisma.analysisType.delete({
      where: { id },
    });

    return { message: 'Tipo de análisis eliminado exitosamente' };
  }
}
