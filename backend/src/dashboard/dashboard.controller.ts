import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /**
   * Obtiene resumen general del sistema
   */
  @Get('overview')
  @ApiOperation({
    summary: 'Resumen general',
    description: 'Obtiene estadísticas generales del sistema',
  })
  @ApiResponse({
    status: 200,
    description: 'Resumen general del sistema',
  })
  getOverview() {
    return this.dashboardService.getOverview();
  }

  /**
   * Obtiene estadísticas de requerimientos
   */
  @Get('requirements/stats')
  @ApiOperation({
    summary: 'Estadísticas de requerimientos',
    description:
      'Obtiene estadísticas agregadas de requerimientos por estado, prioridad y mes',
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas de requerimientos',
  })
  getRequirementStats() {
    return this.dashboardService.getRequirementStats();
  }

  /**
   * Obtiene estadísticas de muestras
   */
  @Get('samples/stats')
  @ApiOperation({
    summary: 'Estadísticas de muestras',
    description:
      'Obtiene estadísticas agregadas de muestras por estado, tipo y mes',
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas de muestras',
  })
  getSampleStats() {
    return this.dashboardService.getSampleStats();
  }

  /**
   * Obtiene estadísticas de análisis
   */
  @Get('analysis/stats')
  @ApiOperation({
    summary: 'Estadísticas de análisis',
    description:
      'Obtiene estadísticas agregadas de análisis por estado, tipo y mes',
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas de análisis',
  })
  getAnalysisStats() {
    return this.dashboardService.getAnalysisStats();
  }

  /**
   * Obtiene actividad reciente
   */
  @Get('activity/recent')
  @ApiOperation({
    summary: 'Actividad reciente',
    description: 'Obtiene los últimos eventos y actividad del sistema',
  })
  @ApiResponse({
    status: 200,
    description: 'Actividad reciente del sistema',
  })
  getRecentActivity() {
    return this.dashboardService.getRecentActivity();
  }

  /**
   * Obtiene elementos pendientes
   */
  @Get('pending')
  @ApiOperation({
    summary: 'Elementos pendientes',
    description: 'Obtiene todos los elementos pendientes de atención',
  })
  @ApiResponse({
    status: 200,
    description: 'Elementos pendientes',
  })
  getPendingItems() {
    return this.dashboardService.getPendingItems();
  }
}
