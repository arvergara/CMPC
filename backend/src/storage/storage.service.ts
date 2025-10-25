import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../common/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateStorageDto } from './dto/create-storage.dto';
import { UpdateStorageDto } from './dto/update-storage.dto';
import { StorageStatus } from '@prisma/client';

@Injectable()
export class StorageService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  /**
   * Almacena una muestra en bodega
   */
  async create(createStorageDto: CreateStorageDto) {
    // Verificar que la muestra existe
    const sample = await this.prisma.sample.findUnique({
      where: { id: createStorageDto.sampleId },
    });

    if (!sample) {
      throw new NotFoundException('Muestra no encontrada');
    }

    // Verificar que la muestra no está ya almacenada
    const existingStorage = await this.prisma.storage.findUnique({
      where: { sampleId: createStorageDto.sampleId },
    });

    if (existingStorage) {
      throw new ConflictException('La muestra ya está almacenada');
    }

    // Crear registro de almacenamiento
    const storage = await this.prisma.storage.create({
      data: {
        sampleId: createStorageDto.sampleId,
        ubicacionFisica: createStorageDto.ubicacionFisica,
        estanteria: createStorageDto.estanteria,
        caja: createStorageDto.caja,
        posicion: createStorageDto.posicion,
        fechaVencimientoEstimada: createStorageDto.fechaVencimientoEstimada
          ? new Date(createStorageDto.fechaVencimientoEstimada)
          : undefined,
        estado: StorageStatus.OCUPADA,
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
      },
    });

    return storage;
  }

  /**
   * Obtiene todos los registros de almacenamiento con filtros
   */
  async findAll(filters?: {
    estado?: StorageStatus;
    ubicacionFisica?: string;
    estanteria?: string;
  }) {
    const where: any = {};

    if (filters?.estado) {
      where.estado = filters.estado;
    }

    if (filters?.ubicacionFisica) {
      where.ubicacionFisica = {
        contains: filters.ubicacionFisica,
      };
    }

    if (filters?.estanteria) {
      where.estanteria = filters.estanteria;
    }

    const storages = await this.prisma.storage.findMany({
      where,
      include: {
        sample: {
          include: {
            requirement: {
              select: {
                codigo: true,
                investigadorId: true,
              },
            },
          },
        },
      },
      orderBy: {
        fechaIngreso: 'desc',
      },
    });

    return storages;
  }

  /**
   * Obtiene un registro de almacenamiento por ID
   */
  async findOne(id: string) {
    const storage = await this.prisma.storage.findUnique({
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
            qrEvents: {
              orderBy: {
                timestamp: 'desc',
              },
              take: 10,
            },
          },
        },
      },
    });

    if (!storage) {
      throw new NotFoundException(`Almacenamiento con ID ${id} no encontrado`);
    }

    return storage;
  }

  /**
   * Obtiene el almacenamiento de una muestra
   */
  async findBySampleId(sampleId: string) {
    const storage = await this.prisma.storage.findUnique({
      where: { sampleId },
      include: {
        sample: {
          include: {
            requirement: true,
          },
        },
      },
    });

    if (!storage) {
      throw new NotFoundException(
        `No se encontró almacenamiento para la muestra ${sampleId}`,
      );
    }

    return storage;
  }

  /**
   * Actualiza un registro de almacenamiento
   */
  async update(id: string, updateStorageDto: UpdateStorageDto) {
    const existing = await this.prisma.storage.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Almacenamiento con ID ${id} no encontrado`);
    }

    const updated = await this.prisma.storage.update({
      where: { id },
      data: {
        ubicacionFisica: updateStorageDto.ubicacionFisica,
        estanteria: updateStorageDto.estanteria,
        caja: updateStorageDto.caja,
        posicion: updateStorageDto.posicion,
        fechaVencimientoEstimada: updateStorageDto.fechaVencimientoEstimada
          ? new Date(updateStorageDto.fechaVencimientoEstimada)
          : undefined,
        estado: updateStorageDto.estado,
      },
      include: {
        sample: {
          include: {
            requirement: true,
          },
        },
      },
    });

    return updated;
  }

  /**
   * Solicitar eliminación de una muestra almacenada
   */
  async requestDeletion(id: string) {
    const storage = await this.prisma.storage.findUnique({
      where: { id },
    });

    if (!storage) {
      throw new NotFoundException(`Almacenamiento con ID ${id} no encontrado`);
    }

    if (storage.solicitudEliminacion) {
      throw new BadRequestException(
        'Ya existe una solicitud de eliminación pendiente',
      );
    }

    const updated = await this.prisma.storage.update({
      where: { id },
      data: {
        solicitudEliminacion: true,
      },
      include: {
        sample: true,
      },
    });

    return updated;
  }

  /**
   * Aprobar eliminación de una muestra almacenada
   */
  async approveDeletion(id: string) {
    const storage = await this.prisma.storage.findUnique({
      where: { id },
    });

    if (!storage) {
      throw new NotFoundException(`Almacenamiento con ID ${id} no encontrado`);
    }

    if (!storage.solicitudEliminacion) {
      throw new BadRequestException(
        'No existe una solicitud de eliminación para aprobar',
      );
    }

    if (storage.aprobadaEliminacion) {
      throw new BadRequestException('La eliminación ya fue aprobada');
    }

    const updated = await this.prisma.storage.update({
      where: { id },
      data: {
        aprobadaEliminacion: true,
        estado: StorageStatus.DISPONIBLE,
      },
      include: {
        sample: true,
      },
    });

    return updated;
  }

  /**
   * Obtiene muestras próximas a vencer
   */
  async getExpiringSoon(days: number = 30) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const storages = await this.prisma.storage.findMany({
      where: {
        AND: [
          {
            fechaVencimientoEstimada: {
              lte: futureDate,
            },
          },
          {
            fechaVencimientoEstimada: {
              gte: new Date(),
            },
          },
          {
            estado: StorageStatus.OCUPADA,
          },
        ],
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
      },
      orderBy: {
        fechaVencimientoEstimada: 'asc',
      },
    });

    return storages;
  }

  /**
   * Obtiene ubicaciones disponibles en una estantería
   */
  async getAvailableLocations(estanteria: string) {
    const storages = await this.prisma.storage.findMany({
      where: {
        estanteria,
      },
      select: {
        ubicacionFisica: true,
        caja: true,
        posicion: true,
        estado: true,
      },
    });

    const available = storages.filter(
      (s) => s.estado === StorageStatus.DISPONIBLE,
    );
    const occupied = storages.filter(
      (s) => s.estado === StorageStatus.OCUPADA,
    );

    return {
      estanteria,
      total: storages.length,
      disponibles: available.length,
      ocupadas: occupied.length,
      locations: storages,
    };
  }

  /**
   * Obtiene estadísticas de almacenamiento
   */
  async getStatistics() {
    const total = await this.prisma.storage.count();

    const byStatus = await this.prisma.storage.groupBy({
      by: ['estado'],
      _count: {
        estado: true,
      },
    });

    const withDeletionRequest = await this.prisma.storage.count({
      where: {
        solicitudEliminacion: true,
        aprobadaEliminacion: false,
      },
    });

    const byLocation = await this.prisma.storage.groupBy({
      by: ['ubicacionFisica'],
      _count: {
        ubicacionFisica: true,
      },
      orderBy: {
        _count: {
          ubicacionFisica: 'desc',
        },
      },
    });

    return {
      total,
      byStatus: byStatus.map((item) => ({
        status: item.estado,
        count: item._count.estado,
      })),
      pendingDeletion: withDeletionRequest,
      byLocation: byLocation.map((item) => ({
        location: item.ubicacionFisica,
        count: item._count.ubicacionFisica,
      })),
    };
  }

  /**
   * Eliminar un registro de almacenamiento
   */
  async remove(id: string) {
    const storage = await this.prisma.storage.findUnique({
      where: { id },
    });

    if (!storage) {
      throw new NotFoundException(`Almacenamiento con ID ${id} no encontrado`);
    }

    // Solo se puede eliminar si está aprobada la eliminación
    if (!storage.aprobadaEliminacion) {
      throw new BadRequestException(
        'La eliminación debe ser aprobada primero',
      );
    }

    await this.prisma.storage.delete({
      where: { id },
    });

    return { message: 'Registro de almacenamiento eliminado exitosamente' };
  }

  /**
   * Tarea programada: Verifica muestras próximas a vencer y envía notificaciones
   * Se ejecuta todos los días a las 8:00 AM
   */
  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async checkExpiringStorages() {
    console.log('Verificando muestras próximas a vencer...');

    try {
      // Obtener muestras que vencen en los próximos 7 días
      const expiringSoon = await this.getExpiringSoon(7);

      if (expiringSoon.length === 0) {
        console.log('No hay muestras próximas a vencer.');
        return;
      }

      // Agrupar por investigador
      const byInvestigador = new Map<string, typeof expiringSoon>();

      for (const storage of expiringSoon) {
        const investigador = storage.sample?.requirement?.investigador;
        if (!investigador) continue;

        if (!byInvestigador.has(investigador.email)) {
          byInvestigador.set(investigador.email, []);
        }

        byInvestigador.get(investigador.email)!.push(storage);
      }

      // Enviar notificación a cada investigador
      for (const [email, storages] of byInvestigador.entries()) {
        try {
          const responsableNombre =
            storages[0].sample?.requirement?.investigador?.nombre || 'Investigador';

          await this.notificationsService.notifyStorageExpiration({
            to: email,
            responsableNombre,
            muestrasProximasVencer: storages.map((s) => ({
              codigoQR: s.sample?.codigoQR || '',
              ubicacion: s.ubicacionFisica,
              fechaVencimiento: s.fechaVencimientoEstimada!,
            })),
          });

          console.log(
            `Notificación de vencimiento enviada a ${email} (${storages.length} muestras)`,
          );
        } catch (error) {
          console.error(
            `Error al enviar notificación de vencimiento a ${email}:`,
            error,
          );
        }
      }

      console.log(
        `Verificación completada. ${expiringSoon.length} muestras próximas a vencer, notificaciones enviadas a ${byInvestigador.size} investigadores.`,
      );
    } catch (error) {
      console.error('Error en tarea programada de verificación de vencimientos:', error);
    }
  }
}
