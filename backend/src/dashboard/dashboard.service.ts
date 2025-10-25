import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { RequirementStatus, SampleStatus, AnalysisStatus } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  /**
   * Obtiene estadísticas generales del sistema
   */
  async getOverview() {
    const [
      totalRequirements,
      totalSamples,
      totalAnalysis,
      totalStorage,
      activeUsers,
      pendingRequirements,
      pendingSamples,
      pendingAnalysis,
    ] = await Promise.all([
      this.prisma.requirement.count(),
      this.prisma.sample.count(),
      this.prisma.analysis.count(),
      this.prisma.storage.count(),
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.requirement.count({
        where: { estado: RequirementStatus.DRAFT },
      }),
      this.prisma.sample.count({
        where: { estado: SampleStatus.ESPERADA },
      }),
      this.prisma.analysis.count({
        where: { estado: AnalysisStatus.PENDIENTE },
      }),
    ]);

    return {
      totals: {
        requirements: totalRequirements,
        samples: totalSamples,
        analysis: totalAnalysis,
        storage: totalStorage,
        activeUsers,
      },
      pending: {
        requirements: pendingRequirements,
        samples: pendingSamples,
        analysis: pendingAnalysis,
      },
    };
  }

  /**
   * Obtiene estadísticas de requerimientos
   */
  async getRequirementStats() {
    const byStatus = await this.prisma.requirement.groupBy({
      by: ['estado'],
      _count: {
        estado: true,
      },
    });

    // Requerimientos por mes (últimos 6 meses)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const recentRequirements = await this.prisma.requirement.findMany({
      where: {
        createdAt: {
          gte: sixMonthsAgo,
        },
      },
      select: {
        createdAt: true,
      },
    });

    const byMonth = this.groupByMonth(recentRequirements);

    return {
      byStatus: byStatus.map((item) => ({
        status: item.estado,
        count: item._count.estado,
      })),
      byMonth,
    };
  }

  /**
   * Obtiene estadísticas de muestras
   */
  async getSampleStats() {
    const byStatus = await this.prisma.sample.groupBy({
      by: ['estado'],
      _count: {
        estado: true,
      },
    });

    const byType = await this.prisma.sample.groupBy({
      by: ['tipo'],
      _count: {
        tipo: true,
      },
    });

    // Muestras recibidas por mes (últimos 6 meses)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const recentSamples = await this.prisma.sample.findMany({
      where: {
        fechaRecepcion: {
          gte: sixMonthsAgo,
        },
      },
      select: {
        fechaRecepcion: true,
      },
    });

    const byMonth = this.groupByMonth(
      recentSamples
        .filter((s) => s.fechaRecepcion !== null)
        .map((s) => ({ createdAt: s.fechaRecepcion as Date })),
    );

    return {
      byStatus: byStatus.map((item) => ({
        status: item.estado,
        count: item._count.estado,
      })),
      byType: byType.map((item) => ({
        type: item.tipo,
        count: item._count.tipo,
      })),
      byMonth,
    };
  }

  /**
   * Obtiene estadísticas de análisis
   */
  async getAnalysisStats() {
    const byStatus = await this.prisma.analysis.groupBy({
      by: ['estado'],
      _count: {
        estado: true,
      },
    });

    // Top 10 tipos de análisis más solicitados
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

    const typeIds = byType.map((item) => item.tipoAnalisisId);
    const types = await this.prisma.analysisType.findMany({
      where: { id: { in: typeIds } },
      select: { id: true, nombre: true },
    });

    const typeMap = new Map(types.map((t) => [t.id, t.nombre]));

    // Análisis completados por mes (últimos 6 meses)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const completedAnalysis = await this.prisma.analysis.findMany({
      where: {
        estado: AnalysisStatus.COMPLETADO,
        fechaFin: {
          gte: sixMonthsAgo,
        },
      },
      select: {
        fechaFin: true,
      },
    });

    const byMonth = this.groupByMonth(
      completedAnalysis
        .filter((a) => a.fechaFin !== null)
        .map((a) => ({ createdAt: a.fechaFin as Date })),
    );

    return {
      byStatus: byStatus.map((item) => ({
        status: item.estado,
        count: item._count.estado,
      })),
      byType: byType.map((item) => ({
        tipoAnalisisId: item.tipoAnalisisId,
        tipoAnalisisNombre:
          typeMap.get(item.tipoAnalisisId) || 'Desconocido',
        count: item._count.tipoAnalisisId,
      })),
      byMonth,
    };
  }

  /**
   * Obtiene actividad reciente del sistema
   */
  async getRecentActivity() {
    const [recentRequirements, recentSamples, recentAnalysis, recentQREvents] =
      await Promise.all([
        this.prisma.requirement.findMany({
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            codigo: true,
            estado: true,
            createdAt: true,
            investigador: {
              select: { nombre: true },
            },
          },
        }),
        this.prisma.sample.findMany({
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            codigoQR: true,
            estado: true,
            createdAt: true,
            requirement: {
              select: { codigo: true },
            },
          },
        }),
        this.prisma.analysis.findMany({
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            estado: true,
            createdAt: true,
            sample: {
              select: { codigoQR: true },
            },
            tipoAnalisis: {
              select: { nombre: true },
            },
          },
        }),
        this.prisma.qREvent.findMany({
          take: 10,
          orderBy: { timestamp: 'desc' },
          select: {
            id: true,
            tipoEvento: true,
            timestamp: true,
            ubicacion: true,
            sample: {
              select: { codigoQR: true },
            },
            usuario: {
              select: { nombre: true },
            },
          },
        }),
      ]);

    return {
      requirements: recentRequirements,
      samples: recentSamples,
      analysis: recentAnalysis,
      qrEvents: recentQREvents,
    };
  }

  /**
   * Obtiene elementos pendientes por usuario
   */
  async getPendingItems() {
    const [pendingRequirements, pendingSamples, pendingAnalysis] =
      await Promise.all([
        this.prisma.requirement.findMany({
          where: { estado: RequirementStatus.DRAFT },
          select: {
            id: true,
            codigo: true,
            createdAt: true,
            investigador: {
              select: { nombre: true, email: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        }),
        this.prisma.sample.findMany({
          where: { estado: SampleStatus.ESPERADA },
          select: {
            id: true,
            codigoQR: true,
            tipo: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'asc' },
        }),
        this.prisma.analysis.findMany({
          where: { estado: AnalysisStatus.PENDIENTE },
          select: {
            id: true,
            sample: {
              select: { codigoQR: true },
            },
            tipoAnalisis: {
              select: { nombre: true },
            },
            createdAt: true,
          },
          orderBy: { createdAt: 'asc' },
        }),
      ]);

    return {
      requirements: pendingRequirements,
      samples: pendingSamples,
      analysis: pendingAnalysis,
    };
  }

  /**
   * Agrupa items por mes
   */
  private groupByMonth(items: { createdAt: Date }[]) {
    const monthCounts = new Map<string, number>();

    items.forEach((item) => {
      if (!item.createdAt) return;
      const date = new Date(item.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthCounts.set(monthKey, (monthCounts.get(monthKey) || 0) + 1);
    });

    return Array.from(monthCounts.entries())
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }
}
