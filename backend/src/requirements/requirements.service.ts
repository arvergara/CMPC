import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateRequirementDto } from './dto/create-requirement.dto';
import { UpdateRequirementDto } from './dto/update-requirement.dto';
import { RequirementStatus } from '@prisma/client';
import { format } from 'date-fns';

@Injectable()
export class RequirementsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  /**
   * Genera un código único para el requerimiento
   * Formato: REQ-YYYY-NNNNNN
   */
  private async generateRequirementCode(): Promise<string> {
    const year = format(new Date(), 'yyyy');
    const prefix = `REQ-${year}-`;

    // Obtener el último requerimiento del año
    const lastRequirement = await this.prisma.requirement.findFirst({
      where: {
        codigo: {
          startsWith: prefix,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    let nextNumber = 1;
    if (lastRequirement) {
      const lastNumber = parseInt(lastRequirement.codigo.split('-')[2]);
      nextNumber = lastNumber + 1;
    }

    // Formato: REQ-2024-000001
    const code = `${prefix}${nextNumber.toString().padStart(6, '0')}`;
    return code;
  }

  /**
   * Crea un nuevo requerimiento
   */
  async create(createRequirementDto: CreateRequirementDto) {
    // Verificar que el investigador existe
    const investigador = await this.prisma.user.findUnique({
      where: { id: createRequirementDto.investigadorId },
    });

    if (!investigador) {
      throw new NotFoundException('Investigador no encontrado');
    }

    // Generar código único
    const codigo = await this.generateRequirementCode();

    // Crear el requerimiento
    const requirement = await this.prisma.requirement.create({
      data: {
        codigo,
        investigadorId: createRequirementDto.investigadorId,
        tipoMuestra: createRequirementDto.tipoMuestra,
        cantidadEsperada: createRequirementDto.cantidadEsperada,
        descripcion: createRequirementDto.descripcion,
        documentosAdjuntos: createRequirementDto.documentosAdjuntos || [],
        plantaId: createRequirementDto.plantaId,
        laboratorioAsignadoId: createRequirementDto.laboratorioAsignadoId,
        estado: RequirementStatus.DRAFT,
      },
      include: {
        investigador: {
          select: {
            id: true,
            email: true,
            nombre: true,
            rol: true,
          },
        },
        planta: true,
        laboratorioAsignado: true,
      },
    });

    // Enviar notificación al investigador
    try {
      await this.notificationsService.notifyRequirementCreated({
        to: investigador.email,
        investigadorNombre: investigador.nombre,
        codigo: requirement.codigo,
        numeroMuestras: requirement.cantidadEsperada,
      });
    } catch (error) {
      console.error('Error al enviar notificación de requerimiento creado:', error);
      // No lanzar error para no bloquear la creación del requerimiento
    }

    return requirement;
  }

  /**
   * Obtiene todos los requerimientos con filtros opcionales
   */
  async findAll(filters?: {
    investigadorId?: string;
    estado?: RequirementStatus;
    plantaId?: string;
  }) {
    const where: any = {};

    if (filters?.investigadorId) {
      where.investigadorId = filters.investigadorId;
    }

    if (filters?.estado) {
      where.estado = filters.estado;
    }

    if (filters?.plantaId) {
      where.plantaId = filters.plantaId;
    }

    const requirements = await this.prisma.requirement.findMany({
      where,
      include: {
        investigador: {
          select: {
            id: true,
            email: true,
            nombre: true,
            rol: true,
          },
        },
        planta: true,
        laboratorioAsignado: true,
        samples: {
          select: {
            id: true,
            codigoQR: true,
            estado: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return requirements;
  }

  /**
   * Obtiene un requerimiento por ID
   */
  async findOne(id: string) {
    const requirement = await this.prisma.requirement.findUnique({
      where: { id },
      include: {
        investigador: {
          select: {
            id: true,
            email: true,
            nombre: true,
            rol: true,
          },
        },
        planta: true,
        laboratorioAsignado: true,
        samples: {
          include: {
            qrEvents: {
              orderBy: {
                timestamp: 'desc',
              },
              take: 5,
            },
          },
        },
      },
    });

    if (!requirement) {
      throw new NotFoundException(`Requerimiento con ID ${id} no encontrado`);
    }

    return requirement;
  }

  /**
   * Obtiene requerimientos por código
   */
  async findByCode(codigo: string) {
    const requirement = await this.prisma.requirement.findUnique({
      where: { codigo },
      include: {
        investigador: {
          select: {
            id: true,
            email: true,
            nombre: true,
            rol: true,
          },
        },
        planta: true,
        laboratorioAsignado: true,
        samples: true,
      },
    });

    if (!requirement) {
      throw new NotFoundException(
        `Requerimiento con código ${codigo} no encontrado`,
      );
    }

    return requirement;
  }

  /**
   * Actualiza un requerimiento
   * Solo se puede editar si está en estado DRAFT
   */
  async update(id: string, updateRequirementDto: UpdateRequirementDto) {
    // Verificar que el requerimiento existe
    const existing = await this.prisma.requirement.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Requerimiento con ID ${id} no encontrado`);
    }

    // Verificar que se puede editar (solo DRAFT)
    if (
      existing.estado !== RequirementStatus.DRAFT &&
      !updateRequirementDto.estado
    ) {
      throw new ForbiddenException(
        'Solo se pueden editar requerimientos en estado DRAFT',
      );
    }

    const updated = await this.prisma.requirement.update({
      where: { id },
      data: {
        ...updateRequirementDto,
        documentosAdjuntos: updateRequirementDto.documentosAdjuntos
          ? updateRequirementDto.documentosAdjuntos
          : undefined,
      },
      include: {
        investigador: {
          select: {
            id: true,
            email: true,
            nombre: true,
            rol: true,
          },
        },
        planta: true,
        laboratorioAsignado: true,
      },
    });

    return updated;
  }

  /**
   * Cambia el estado de un requerimiento
   */
  async changeStatus(id: string, newStatus: RequirementStatus) {
    const requirement = await this.prisma.requirement.findUnique({
      where: { id },
    });

    if (!requirement) {
      throw new NotFoundException(`Requerimiento con ID ${id} no encontrado`);
    }

    // Validar transiciones de estado permitidas
    const validTransitions: Record<RequirementStatus, RequirementStatus[]> = {
      [RequirementStatus.DRAFT]: [
        RequirementStatus.ENVIADO,
        RequirementStatus.CANCELADO,
      ],
      [RequirementStatus.ENVIADO]: [
        RequirementStatus.EN_PROCESO,
        RequirementStatus.CANCELADO,
      ],
      [RequirementStatus.EN_PROCESO]: [
        RequirementStatus.COMPLETADO,
        RequirementStatus.CANCELADO,
      ],
      [RequirementStatus.COMPLETADO]: [],
      [RequirementStatus.CANCELADO]: [],
    };

    if (!validTransitions[requirement.estado].includes(newStatus)) {
      throw new BadRequestException(
        `No se puede cambiar de ${requirement.estado} a ${newStatus}`,
      );
    }

    const updated = await this.prisma.requirement.update({
      where: { id },
      data: { estado: newStatus },
      include: {
        investigador: {
          select: {
            id: true,
            email: true,
            nombre: true,
            rol: true,
          },
        },
        planta: true,
        laboratorioAsignado: true,
      },
    });

    return updated;
  }

  /**
   * Obtiene el historial de requerimientos de un investigador
   */
  async getMyHistory(investigadorId: string) {
    const requirements = await this.prisma.requirement.findMany({
      where: {
        investigadorId,
      },
      include: {
        planta: true,
        laboratorioAsignado: true,
        samples: {
          select: {
            id: true,
            codigoQR: true,
            estado: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return requirements;
  }

  /**
   * Elimina un requerimiento (soft delete cambiando a CANCELADO)
   */
  async remove(id: string) {
    const requirement = await this.prisma.requirement.findUnique({
      where: { id },
      include: {
        samples: true,
      },
    });

    if (!requirement) {
      throw new NotFoundException(`Requerimiento con ID ${id} no encontrado`);
    }

    // Solo se puede eliminar si no tiene muestras asociadas
    if (requirement.samples.length > 0) {
      throw new BadRequestException(
        'No se puede eliminar un requerimiento con muestras asociadas',
      );
    }

    // Soft delete: cambiar a CANCELADO
    const deleted = await this.prisma.requirement.update({
      where: { id },
      data: {
        estado: RequirementStatus.CANCELADO,
      },
    });

    return deleted;
  }
}
