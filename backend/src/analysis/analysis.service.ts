import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateAnalysisDto } from './dto/create-analysis.dto';
import { UpdateAnalysisDto } from './dto/update-analysis.dto';
import { UploadResultsDto } from './dto/upload-results.dto';
import { AnalysisStatus } from '@prisma/client';

@Injectable()
export class AnalysisService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  /**
   * Crea un nuevo análisis para una muestra
   */
  async create(createAnalysisDto: CreateAnalysisDto) {
    // Verificar que la muestra existe
    const sample = await this.prisma.sample.findUnique({
      where: { id: createAnalysisDto.sampleId },
    });

    if (!sample) {
      throw new NotFoundException('Muestra no encontrada');
    }

    // Verificar que el tipo de análisis existe
    const analysisType = await this.prisma.analysisType.findUnique({
      where: { id: createAnalysisDto.tipoAnalisisId },
    });

    if (!analysisType) {
      throw new NotFoundException('Tipo de análisis no encontrado');
    }

    if (!analysisType.isActive) {
      throw new BadRequestException('El tipo de análisis no está activo');
    }

    // Verificar responsable si se proporciona
    if (createAnalysisDto.responsableId) {
      const responsable = await this.prisma.user.findUnique({
        where: { id: createAnalysisDto.responsableId },
      });

      if (!responsable) {
        throw new NotFoundException('Responsable no encontrado');
      }
    }

    // Crear el análisis
    const analysis = await this.prisma.analysis.create({
      data: {
        sampleId: createAnalysisDto.sampleId,
        tipoAnalisisId: createAnalysisDto.tipoAnalisisId,
        responsableId: createAnalysisDto.responsableId,
        observaciones: createAnalysisDto.observaciones,
        estado: AnalysisStatus.PENDIENTE,
      },
      include: {
        sample: {
          include: {
            requirement: {
              include: {
                investigador: {
                  select: {
                    id: true,
                    nombre: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
        tipoAnalisis: true,
        responsable: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
      },
    });

    return analysis;
  }

  /**
   * Obtiene todos los análisis con filtros opcionales
   */
  async findAll(filters?: {
    estado?: AnalysisStatus;
    sampleId?: string;
    responsableId?: string;
  }) {
    const where: any = {};

    if (filters?.estado) {
      where.estado = filters.estado;
    }

    if (filters?.sampleId) {
      where.sampleId = filters.sampleId;
    }

    if (filters?.responsableId) {
      where.responsableId = filters.responsableId;
    }

    const analyses = await this.prisma.analysis.findMany({
      where,
      include: {
        sample: {
          select: {
            id: true,
            codigoQR: true,
            tipo: true,
            estado: true,
          },
        },
        tipoAnalisis: {
          select: {
            id: true,
            nombre: true,
            metodo: true,
          },
        },
        responsable: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return analyses;
  }

  /**
   * Obtiene un análisis por ID
   */
  async findOne(id: string) {
    const analysis = await this.prisma.analysis.findUnique({
      where: { id },
      include: {
        sample: {
          include: {
            requirement: {
              include: {
                investigador: {
                  select: {
                    id: true,
                    nombre: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
        tipoAnalisis: true,
        responsable: {
          select: {
            id: true,
            nombre: true,
            email: true,
            rol: true,
          },
        },
      },
    });

    if (!analysis) {
      throw new NotFoundException(`Análisis con ID ${id} no encontrado`);
    }

    return analysis;
  }

  /**
   * Obtiene todos los análisis de una muestra
   */
  async findBySampleId(sampleId: string) {
    // Verificar que la muestra existe
    const sample = await this.prisma.sample.findUnique({
      where: { id: sampleId },
    });

    if (!sample) {
      throw new NotFoundException('Muestra no encontrada');
    }

    const analyses = await this.prisma.analysis.findMany({
      where: { sampleId },
      include: {
        tipoAnalisis: true,
        responsable: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return analyses;
  }

  /**
   * Actualiza un análisis
   */
  async update(id: string, updateAnalysisDto: UpdateAnalysisDto) {
    const existing = await this.prisma.analysis.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Análisis con ID ${id} no encontrado`);
    }

    // Verificar responsable si se actualiza
    if (updateAnalysisDto.responsableId) {
      const responsable = await this.prisma.user.findUnique({
        where: { id: updateAnalysisDto.responsableId },
      });

      if (!responsable) {
        throw new NotFoundException('Responsable no encontrado');
      }
    }

    // Preparar datos para actualizar
    const updateData: any = {
      responsableId: updateAnalysisDto.responsableId,
      observaciones: updateAnalysisDto.observaciones,
      estado: updateAnalysisDto.estado,
      resultadosJson: updateAnalysisDto.resultadosJson,
      archivoPdfUrl: updateAnalysisDto.archivoPdfUrl,
    };

    // Auto-set fechaInicio when status changes to EN_PROCESO
    if (
      updateAnalysisDto.estado === AnalysisStatus.EN_PROCESO &&
      existing.estado !== AnalysisStatus.EN_PROCESO &&
      !existing.fechaInicio
    ) {
      updateData.fechaInicio = new Date();
    }

    // Auto-set fechaFin when status changes to COMPLETADO
    if (
      updateAnalysisDto.estado === AnalysisStatus.COMPLETADO &&
      existing.estado !== AnalysisStatus.COMPLETADO &&
      !existing.fechaFin
    ) {
      updateData.fechaFin = new Date();
    }

    // Allow manual override of dates if provided
    if (updateAnalysisDto.fechaInicio) {
      updateData.fechaInicio = new Date(updateAnalysisDto.fechaInicio);
    }

    if (updateAnalysisDto.fechaFin) {
      updateData.fechaFin = new Date(updateAnalysisDto.fechaFin);
    }

    const updated = await this.prisma.analysis.update({
      where: { id },
      data: updateData,
      include: {
        sample: true,
        tipoAnalisis: true,
        responsable: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
      },
    });

    return updated;
  }

  /**
   * Inicia un análisis
   */
  async start(id: string, responsableId?: string) {
    const analysis = await this.prisma.analysis.findUnique({
      where: { id },
      include: {
        sample: true,
      },
    });

    if (!analysis) {
      throw new NotFoundException(`Análisis con ID ${id} no encontrado`);
    }

    if (analysis.estado !== AnalysisStatus.PENDIENTE) {
      throw new BadRequestException(
        `El análisis debe estar en estado PENDIENTE para iniciarse. Estado actual: ${analysis.estado}`,
      );
    }

    // Verificar responsable si se proporciona
    if (responsableId) {
      const responsable = await this.prisma.user.findUnique({
        where: { id: responsableId },
      });

      if (!responsable) {
        throw new NotFoundException('Responsable no encontrado');
      }
    }

    const updated = await this.prisma.analysis.update({
      where: { id },
      data: {
        estado: AnalysisStatus.EN_PROCESO,
        fechaInicio: new Date(),
        responsableId: responsableId || analysis.responsableId,
      },
      include: {
        sample: true,
        tipoAnalisis: true,
        responsable: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
      },
    });

    return updated;
  }

  /**
   * Completa un análisis
   */
  async complete(id: string, uploadResultsDto?: UploadResultsDto) {
    const analysis = await this.prisma.analysis.findUnique({
      where: { id },
    });

    if (!analysis) {
      throw new NotFoundException(`Análisis con ID ${id} no encontrado`);
    }

    if (analysis.estado !== AnalysisStatus.EN_PROCESO) {
      throw new BadRequestException(
        `El análisis debe estar EN_PROCESO para completarse. Estado actual: ${analysis.estado}`,
      );
    }

    const dataToUpdate: any = {
      estado: AnalysisStatus.COMPLETADO,
      fechaFin: new Date(),
    };

    if (uploadResultsDto) {
      dataToUpdate.resultadosJson = uploadResultsDto.resultadosJson;
      dataToUpdate.archivoPdfUrl = uploadResultsDto.archivoPdfUrl;
      if (uploadResultsDto.observaciones) {
        dataToUpdate.observaciones = uploadResultsDto.observaciones;
      }
    }

    const updated = await this.prisma.analysis.update({
      where: { id },
      data: dataToUpdate,
      include: {
        sample: {
          include: {
            requirement: {
              include: {
                investigador: {
                  select: {
                    id: true,
                    nombre: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
        tipoAnalisis: true,
        responsable: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
      },
    });

    // Enviar notificación al investigador
    if (updated.sample?.requirement?.investigador && updated.fechaFin) {
      try {
        await this.notificationsService.notifyAnalysisCompleted({
          to: updated.sample.requirement.investigador.email,
          investigadorNombre: updated.sample.requirement.investigador.nombre,
          codigoQR: updated.sample.codigoQR,
          tipoAnalisis: updated.tipoAnalisis.nombre,
          fechaFin: updated.fechaFin,
        });
      } catch (error) {
        console.error('Error al enviar notificación de análisis completado:', error);
        // No lanzar error para no bloquear la finalización del análisis
      }
    }

    return updated;
  }

  /**
   * Cancela un análisis
   */
  async cancel(id: string, motivo?: string) {
    const analysis = await this.prisma.analysis.findUnique({
      where: { id },
    });

    if (!analysis) {
      throw new NotFoundException(`Análisis con ID ${id} no encontrado`);
    }

    if (analysis.estado === AnalysisStatus.COMPLETADO) {
      throw new BadRequestException(
        'No se puede cancelar un análisis que ya está completado',
      );
    }

    if (analysis.estado === AnalysisStatus.CANCELADO) {
      throw new BadRequestException('El análisis ya está cancelado');
    }

    const updated = await this.prisma.analysis.update({
      where: { id },
      data: {
        estado: AnalysisStatus.CANCELADO,
        observaciones: motivo
          ? `${analysis.observaciones || ''}\nMotivo de cancelación: ${motivo}`
          : analysis.observaciones,
      },
      include: {
        sample: true,
        tipoAnalisis: true,
        responsable: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
      },
    });

    return updated;
  }

  /**
   * Sube resultados a un análisis
   */
  async uploadResults(id: string, uploadResultsDto: UploadResultsDto) {
    const analysis = await this.prisma.analysis.findUnique({
      where: { id },
    });

    if (!analysis) {
      throw new NotFoundException(`Análisis con ID ${id} no encontrado`);
    }

    if (analysis.estado === AnalysisStatus.CANCELADO) {
      throw new BadRequestException(
        'No se pueden subir resultados a un análisis cancelado',
      );
    }

    const updated = await this.prisma.analysis.update({
      where: { id },
      data: {
        resultadosJson: uploadResultsDto.resultadosJson,
        archivoPdfUrl: uploadResultsDto.archivoPdfUrl,
        observaciones: uploadResultsDto.observaciones || analysis.observaciones,
      },
      include: {
        sample: true,
        tipoAnalisis: true,
        responsable: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
      },
    });

    return updated;
  }

  /**
   * Obtiene análisis por estado
   */
  async getByStatus(estado: AnalysisStatus) {
    const analyses = await this.prisma.analysis.findMany({
      where: { estado },
      include: {
        sample: {
          select: {
            id: true,
            codigoQR: true,
            tipo: true,
          },
        },
        tipoAnalisis: {
          select: {
            id: true,
            nombre: true,
            tiempoEstimadoHoras: true,
          },
        },
        responsable: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return analyses;
  }

  /**
   * Obtiene estadísticas de análisis
   */
  async getStatistics() {
    const total = await this.prisma.analysis.count();

    const byStatus = await this.prisma.analysis.groupBy({
      by: ['estado'],
      _count: {
        estado: true,
      },
    });

    const byType = await this.prisma.analysis.groupBy({
      by: ['tipoAnalisisId'],
      _count: {
        tipoAnalisisId: true,
      },
      orderBy: {
        _count: {
          tipoAnalisisId: 'desc',
        },
      },
      take: 10,
    });

    // Obtener nombres de tipos de análisis
    const typeIds = byType.map((item) => item.tipoAnalisisId);
    const types = await this.prisma.analysisType.findMany({
      where: {
        id: {
          in: typeIds,
        },
      },
      select: {
        id: true,
        nombre: true,
      },
    });

    const typeMap = new Map(types.map((t) => [t.id, t.nombre]));

    // Análisis en proceso
    const enProceso = await this.prisma.analysis.count({
      where: { estado: AnalysisStatus.EN_PROCESO },
    });

    // Análisis pendientes
    const pendientes = await this.prisma.analysis.count({
      where: { estado: AnalysisStatus.PENDIENTE },
    });

    // Análisis completados hoy
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const completadosHoy = await this.prisma.analysis.count({
      where: {
        estado: AnalysisStatus.COMPLETADO,
        fechaFin: {
          gte: today,
        },
      },
    });

    return {
      total,
      byStatus: byStatus.map((item) => ({
        status: item.estado,
        count: item._count.estado,
      })),
      byType: byType.map((item) => ({
        tipoAnalisisId: item.tipoAnalisisId,
        tipoAnalisisNombre: typeMap.get(item.tipoAnalisisId) || 'Desconocido',
        count: item._count.tipoAnalisisId,
      })),
      enProceso,
      pendientes,
      completadosHoy,
    };
  }
}
