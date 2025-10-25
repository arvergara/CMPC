import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateSampleDto } from './dto/create-sample.dto';
import { UpdateSampleDto } from './dto/update-sample.dto';
import { SampleStatus } from '@prisma/client';
import { format } from 'date-fns';
import * as QRCode from 'qrcode';

@Injectable()
export class SamplesService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  /**
   * Genera un código QR único para la muestra
   * Formato: QR-YYYY-NNNNNN
   */
  private async generateQRCode(): Promise<string> {
    const year = format(new Date(), 'yyyy');
    const prefix = `QR-${year}-`;

    // Obtener la última muestra del año
    const lastSample = await this.prisma.sample.findFirst({
      where: {
        codigoQR: {
          startsWith: prefix,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    let nextNumber = 1;
    if (lastSample) {
      const lastNumber = parseInt(lastSample.codigoQR.split('-')[2]);
      nextNumber = lastNumber + 1;
    }

    // Formato: QR-2025-000001
    const qrCode = `${prefix}${nextNumber.toString().padStart(6, '0')}`;
    return qrCode;
  }

  /**
   * Crea una nueva muestra
   */
  async create(createSampleDto: CreateSampleDto) {
    // Verificar que el requerimiento existe
    const requirement = await this.prisma.requirement.findUnique({
      where: { id: createSampleDto.requirementId },
    });

    if (!requirement) {
      throw new NotFoundException('Requerimiento no encontrado');
    }

    // Si tiene parent sample, verificar que existe
    if (createSampleDto.parentSampleId) {
      const parentSample = await this.prisma.sample.findUnique({
        where: { id: createSampleDto.parentSampleId },
      });

      if (!parentSample) {
        throw new NotFoundException('Muestra padre no encontrada');
      }
    }

    // Generar código QR único
    const codigoQR = await this.generateQRCode();

    // Crear la muestra
    const sample = await this.prisma.sample.create({
      data: {
        codigoQR,
        requirementId: createSampleDto.requirementId,
        tipo: createSampleDto.tipo,
        formato: createSampleDto.formato,
        cantidad: createSampleDto.cantidad,
        parentSampleId: createSampleDto.parentSampleId,
        esContramuestra: createSampleDto.esContramuestra || false,
        observaciones: createSampleDto.observaciones,
        estado: SampleStatus.ESPERADA,
      },
      include: {
        requirement: {
          include: {
            investigador: {
              select: {
                id: true,
                email: true,
                nombre: true,
                rol: true,
              },
            },
          },
        },
        parentSample: true,
        storage: true,
      },
    });

    return sample;
  }

  /**
   * Obtiene todas las muestras con filtros opcionales
   */
  async findAll(filters?: {
    requirementId?: string;
    estado?: SampleStatus;
    codigoQR?: string;
  }) {
    const where: any = {};

    if (filters?.requirementId) {
      where.requirementId = filters.requirementId;
    }

    if (filters?.estado) {
      where.estado = filters.estado;
    }

    if (filters?.codigoQR) {
      where.codigoQR = {
        contains: filters.codigoQR,
      };
    }

    const samples = await this.prisma.sample.findMany({
      where,
      include: {
        requirement: {
          include: {
            investigador: {
              select: {
                id: true,
                email: true,
                nombre: true,
                rol: true,
              },
            },
          },
        },
        parentSample: true,
        derivedSamples: true,
        storage: true,
        qrEvents: {
          orderBy: {
            timestamp: 'desc',
          },
          take: 5,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return samples;
  }

  /**
   * Obtiene una muestra por ID
   */
  async findOne(id: string) {
    const sample = await this.prisma.sample.findUnique({
      where: { id },
      include: {
        requirement: {
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
        },
        parentSample: true,
        derivedSamples: {
          include: {
            qrEvents: {
              orderBy: {
                timestamp: 'desc',
              },
              take: 3,
            },
          },
        },
        storage: true,
        qrEvents: {
          include: {
            usuario: {
              select: {
                id: true,
                email: true,
                nombre: true,
              },
            },
          },
          orderBy: {
            timestamp: 'desc',
          },
        },
        analysis: {
          include: {
            tipoAnalisis: true,
            responsable: {
              select: {
                id: true,
                email: true,
                nombre: true,
              },
            },
          },
        },
      },
    });

    if (!sample) {
      throw new NotFoundException(`Muestra con ID ${id} no encontrada`);
    }

    return sample;
  }

  /**
   * Obtiene una muestra por código QR
   */
  async findByQRCode(codigoQR: string) {
    const sample = await this.prisma.sample.findUnique({
      where: { codigoQR },
      include: {
        requirement: {
          include: {
            investigador: {
              select: {
                id: true,
                email: true,
                nombre: true,
                rol: true,
              },
            },
          },
        },
        parentSample: true,
        derivedSamples: true,
        storage: true,
        qrEvents: {
          include: {
            usuario: {
              select: {
                id: true,
                nombre: true,
              },
            },
          },
          orderBy: {
            timestamp: 'desc',
          },
          take: 10,
        },
        analysis: true,
      },
    });

    if (!sample) {
      throw new NotFoundException(
        `Muestra con código QR ${codigoQR} no encontrada`,
      );
    }

    return sample;
  }

  /**
   * Actualiza una muestra
   */
  async update(id: string, updateSampleDto: UpdateSampleDto) {
    // Verificar que la muestra existe
    const existing = await this.prisma.sample.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Muestra con ID ${id} no encontrada`);
    }

    // No se puede editar una muestra eliminada
    if (existing.estado === SampleStatus.ELIMINADA) {
      throw new BadRequestException(
        'No se puede editar una muestra eliminada',
      );
    }

    const updated = await this.prisma.sample.update({
      where: { id },
      data: updateSampleDto,
      include: {
        requirement: {
          include: {
            investigador: {
              select: {
                id: true,
                email: true,
                nombre: true,
                rol: true,
              },
            },
          },
        },
        parentSample: true,
        storage: true,
      },
    });

    return updated;
  }

  /**
   * Cambia el estado de una muestra
   */
  async changeStatus(id: string, newStatus: SampleStatus) {
    const sample = await this.prisma.sample.findUnique({
      where: { id },
    });

    if (!sample) {
      throw new NotFoundException(`Muestra con ID ${id} no encontrada`);
    }

    // Validar transiciones de estado permitidas
    const validTransitions: Record<SampleStatus, SampleStatus[]> = {
      [SampleStatus.ESPERADA]: [
        SampleStatus.RECIBIDA,
        SampleStatus.ELIMINADA,
      ],
      [SampleStatus.RECIBIDA]: [
        SampleStatus.EN_ANALISIS,
        SampleStatus.ALMACENADA,
        SampleStatus.ELIMINADA,
      ],
      [SampleStatus.EN_ANALISIS]: [
        SampleStatus.ANALISIS_COMPLETO,
        SampleStatus.ELIMINADA,
      ],
      [SampleStatus.ANALISIS_COMPLETO]: [
        SampleStatus.ALMACENADA,
        SampleStatus.ELIMINADA,
      ],
      [SampleStatus.ALMACENADA]: [SampleStatus.ELIMINADA],
      [SampleStatus.ELIMINADA]: [],
    };

    if (!validTransitions[sample.estado].includes(newStatus)) {
      throw new BadRequestException(
        `No se puede cambiar de ${sample.estado} a ${newStatus}`,
      );
    }

    // Actualizar fechas según el nuevo estado
    const updateData: any = { estado: newStatus };

    if (newStatus === SampleStatus.RECIBIDA && !sample.fechaRecepcion) {
      updateData.fechaRecepcion = new Date();
    }

    if (newStatus === SampleStatus.EN_ANALISIS && !sample.fechaAnalisisInicio) {
      updateData.fechaAnalisisInicio = new Date();
    }

    if (
      newStatus === SampleStatus.ANALISIS_COMPLETO &&
      !sample.fechaAnalisisFin
    ) {
      updateData.fechaAnalisisFin = new Date();
    }

    const updated = await this.prisma.sample.update({
      where: { id },
      data: updateData,
      include: {
        requirement: {
          include: {
            investigador: {
              select: {
                id: true,
                email: true,
                nombre: true,
                rol: true,
              },
            },
          },
        },
        storage: true,
      },
    });

    return updated;
  }

  /**
   * Recibir muestra (cambiar estado a RECIBIDA)
   */
  async receiveSample(id: string, observaciones?: string) {
    const existing = await this.prisma.sample.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Muestra con ID ${id} no encontrada`);
    }

    const updateData: any = {
      estado: SampleStatus.RECIBIDA,
      fechaRecepcion: new Date(),
    };

    // Si hay nuevas observaciones, combinarlas con las existentes
    if (observaciones) {
      const existingObs = existing.observaciones || '';
      updateData.observaciones = existingObs
        ? `${existingObs}\n${observaciones}`
        : observaciones;
    }

    const sample = await this.prisma.sample.update({
      where: { id },
      data: updateData,
      include: {
        requirement: {
          include: {
            investigador: {
              select: {
                id: true,
                email: true,
                nombre: true,
              },
            },
          },
        },
        storage: true,
      },
    });

    // Enviar notificación al investigador
    if (sample.requirement?.investigador) {
      try {
        await this.notificationsService.notifySampleReceived({
          to: sample.requirement.investigador.email,
          investigadorNombre: sample.requirement.investigador.nombre,
          codigoQR: sample.codigoQR,
          codigoRequerimiento: sample.requirement.codigo,
          fechaRecepcion: sample.fechaRecepcion,
        });
      } catch (error) {
        console.error('Error al enviar notificación de muestra recibida:', error);
        // No lanzar error para no bloquear la recepción de la muestra
      }
    }

    return sample;
  }

  /**
   * Crear submuestra o contramuestra
   */
  async createDerivativeSample(
    parentSampleId: string,
    createDto: Partial<CreateSampleDto>,
  ) {
    const parentSample = await this.prisma.sample.findUnique({
      where: { id: parentSampleId },
      include: {
        requirement: true,
      },
    });

    if (!parentSample) {
      throw new NotFoundException('Muestra padre no encontrada');
    }

    // Crear la muestra derivada con los datos del padre
    const derivativeSample = await this.create({
      requirementId: parentSample.requirementId,
      tipo: createDto.tipo || parentSample.tipo,
      formato: createDto.formato || parentSample.formato || undefined,
      cantidad: createDto.cantidad,
      parentSampleId: parentSampleId,
      esContramuestra: createDto.esContramuestra || false,
      observaciones: createDto.observaciones,
    });

    return derivativeSample;
  }

  /**
   * Eliminar una muestra (soft delete cambiando a ELIMINADA)
   */
  async remove(id: string) {
    const sample = await this.prisma.sample.findUnique({
      where: { id },
      include: {
        derivedSamples: true,
        analysis: true,
      },
    });

    if (!sample) {
      throw new NotFoundException(`Muestra con ID ${id} no encontrada`);
    }

    // No se puede eliminar si tiene análisis en progreso
    const hasActiveAnalysis = sample.analysis.some(
      (analysis) => analysis.estado !== 'COMPLETADO',
    );

    if (hasActiveAnalysis) {
      throw new BadRequestException(
        'No se puede eliminar una muestra con análisis en progreso',
      );
    }

    // Soft delete: cambiar a ELIMINADA
    const deleted = await this.prisma.sample.update({
      where: { id },
      data: {
        estado: SampleStatus.ELIMINADA,
      },
    });

    return deleted;
  }

  /**
   * Obtiene el historial completo de una muestra
   */
  async getHistory(id: string) {
    const sample = await this.prisma.sample.findUnique({
      where: { id },
      include: {
        qrEvents: {
          include: {
            usuario: {
              select: {
                id: true,
                email: true,
                nombre: true,
              },
            },
          },
          orderBy: {
            timestamp: 'asc',
          },
        },
        analysis: {
          include: {
            tipoAnalisis: true,
            responsable: {
              select: {
                id: true,
                nombre: true,
              },
            },
          },
          orderBy: {
            fechaInicio: 'asc',
          },
        },
        storage: true,
      },
    });

    if (!sample) {
      throw new NotFoundException(`Muestra con ID ${id} no encontrada`);
    }

    return {
      sample,
      timeline: sample.qrEvents,
      analysis: sample.analysis,
    };
  }

  /**
   * Genera una imagen QR para una muestra específica
   * @param id ID de la muestra
   * @param format Formato de la imagen (png, svg, dataURL)
   * @returns Buffer con la imagen QR
   */
  async generateQRImage(
    id: string,
    format: 'png' | 'svg' | 'dataURL' = 'png',
  ): Promise<Buffer | string> {
    const sample = await this.prisma.sample.findUnique({
      where: { id },
      select: {
        codigoQR: true,
      },
    });

    if (!sample) {
      throw new NotFoundException(`Muestra con ID ${id} no encontrada`);
    }

    return this.generateQRFromCode(sample.codigoQR, format);
  }

  /**
   * Genera una imagen QR desde un código QR específico
   * @param codigoQR Código QR a convertir en imagen
   * @param format Formato de la imagen (png, svg, dataURL)
   * @returns Buffer con la imagen QR o string (para SVG/dataURL)
   */
  async generateQRFromCode(
    codigoQR: string,
    format: 'png' | 'svg' | 'dataURL' = 'png',
  ): Promise<Buffer | string> {
    try {
      const options = {
        errorCorrectionLevel: 'H' as const,
        type: format === 'png' ? ('png' as const) : ('svg' as const),
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      };

      if (format === 'png') {
        // Retorna un Buffer con la imagen PNG
        return await QRCode.toBuffer(codigoQR, options);
      } else if (format === 'svg') {
        // Retorna un string con el SVG
        return await QRCode.toString(codigoQR, {
          ...options,
          type: 'svg',
        });
      } else if (format === 'dataURL') {
        // Retorna un Data URL (base64)
        return await QRCode.toDataURL(codigoQR, options);
      }

      throw new BadRequestException(`Formato no soportado: ${format}`);
    } catch (error) {
      throw new BadRequestException(
        `Error al generar código QR: ${error.message}`,
      );
    }
  }
}
