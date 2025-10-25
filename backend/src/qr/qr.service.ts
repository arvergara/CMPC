import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateQREventDto } from './dto/create-qr-event.dto';
import { QREventType } from '@prisma/client';

@Injectable()
export class QRService {
  constructor(private prisma: PrismaService) {}

  /**
   * Registra un nuevo evento QR
   */
  async createEvent(createQREventDto: CreateQREventDto) {
    // Buscar la muestra por código QR
    const sample = await this.prisma.sample.findUnique({
      where: { codigoQR: createQREventDto.codigoQR },
    });

    if (!sample) {
      throw new NotFoundException(
        `Muestra con código QR ${createQREventDto.codigoQR} no encontrada`,
      );
    }

    // Verificar que el usuario existe
    const user = await this.prisma.user.findUnique({
      where: { id: createQREventDto.usuarioId },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Crear el evento
    const event = await this.prisma.qREvent.create({
      data: {
        sampleId: sample.id,
        tipoEvento: createQREventDto.tipoEvento,
        usuarioId: createQREventDto.usuarioId,
        ubicacion: createQREventDto.ubicacion,
        metadataJson: createQREventDto.metadataJson,
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
        usuario: {
          select: {
            id: true,
            nombre: true,
            email: true,
            rol: true,
          },
        },
      },
    });

    return event;
  }

  /**
   * Obtiene el historial de eventos de una muestra por QR
   */
  async getEventsByQR(codigoQR: string) {
    const sample = await this.prisma.sample.findUnique({
      where: { codigoQR },
      include: {
        qrEvents: {
          include: {
            usuario: {
              select: {
                id: true,
                nombre: true,
                email: true,
                rol: true,
              },
            },
          },
          orderBy: {
            timestamp: 'desc',
          },
        },
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
        storage: true,
      },
    });

    if (!sample) {
      throw new NotFoundException(
        `Muestra con código QR ${codigoQR} no encontrada`,
      );
    }

    return {
      sample,
      events: sample.qrEvents,
      totalEvents: sample.qrEvents.length,
    };
  }

  /**
   * Obtiene el timeline de una muestra (eventos ordenados cronológicamente)
   */
  async getTimeline(sampleId: string) {
    const sample = await this.prisma.sample.findUnique({
      where: { id: sampleId },
    });

    if (!sample) {
      throw new NotFoundException(`Muestra con ID ${sampleId} no encontrada`);
    }

    const events = await this.prisma.qREvent.findMany({
      where: { sampleId },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            email: true,
            rol: true,
          },
        },
      },
      orderBy: {
        timestamp: 'asc',
      },
    });

    return {
      sampleId: sample.id,
      codigoQR: sample.codigoQR,
      events,
      totalEvents: events.length,
    };
  }

  /**
   * Obtiene eventos por tipo
   */
  async getEventsByType(tipoEvento: QREventType) {
    const events = await this.prisma.qREvent.findMany({
      where: { tipoEvento },
      include: {
        sample: {
          select: {
            id: true,
            codigoQR: true,
            tipo: true,
            estado: true,
          },
        },
        usuario: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: 100, // Limitar a últimos 100 eventos
    });

    return {
      tipoEvento,
      events,
      totalEvents: events.length,
    };
  }

  /**
   * Obtiene eventos recientes (últimos N eventos)
   */
  async getRecentEvents(limit: number = 50) {
    const events = await this.prisma.qREvent.findMany({
      include: {
        sample: {
          select: {
            id: true,
            codigoQR: true,
            tipo: true,
            estado: true,
          },
        },
        usuario: {
          select: {
            id: true,
            nombre: true,
            email: true,
            rol: true,
          },
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: Math.min(limit, 200), // Máximo 200
    });

    return {
      events,
      totalEvents: events.length,
    };
  }

  /**
   * Busca eventos por ubicación
   */
  async searchByLocation(ubicacion: string) {
    const events = await this.prisma.qREvent.findMany({
      where: {
        ubicacion: {
          contains: ubicacion,
        },
      },
      include: {
        sample: {
          select: {
            id: true,
            codigoQR: true,
            tipo: true,
            estado: true,
          },
        },
        usuario: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: 100,
    });

    return {
      ubicacion,
      events,
      totalEvents: events.length,
    };
  }

  /**
   * Estadísticas de eventos por tipo
   */
  async getEventStatistics() {
    const eventCounts = await this.prisma.qREvent.groupBy({
      by: ['tipoEvento'],
      _count: {
        tipoEvento: true,
      },
    });

    const totalEvents = await this.prisma.qREvent.count();

    return {
      totalEvents,
      byType: eventCounts.map((item) => ({
        type: item.tipoEvento,
        count: item._count.tipoEvento,
      })),
    };
  }
}
