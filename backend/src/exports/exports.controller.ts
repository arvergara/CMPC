import {
  Controller,
  Get,
  Param,
  Query,
  Res,
  StreamableFile,
  Header,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { Response } from 'express';
import { ExportsService } from './exports.service';
import { format } from 'date-fns';

@ApiTags('Exports')
@Controller('exports')
export class ExportsController {
  constructor(private readonly exportsService: ExportsService) {}

  /**
   * Exportar dashboard a PDF
   */
  @Get('dashboard/pdf')
  @Header('Content-Type', 'application/pdf')
  @ApiOperation({
    summary: 'Exportar Dashboard a PDF',
    description:
      'Genera un reporte PDF con los KPIs y estadísticas del dashboard',
  })
  @ApiResponse({
    status: 200,
    description: 'PDF generado exitosamente',
  })
  async exportDashboardPDF(@Res({ passthrough: true }) res: Response) {
    const pdfBuffer = await this.exportsService.exportDashboardPDF();

    const filename = `dashboard-${format(new Date(), 'yyyy-MM-dd-HHmm')}.pdf`;

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': pdfBuffer.length,
    });

    return new StreamableFile(pdfBuffer);
  }

  /**
   * Exportar requerimientos a Excel
   */
  @Get('requirements/excel')
  @Header(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  @ApiOperation({
    summary: 'Exportar Requerimientos a Excel',
    description:
      'Genera un archivo Excel con la lista de todos los requerimientos',
  })
  @ApiQuery({
    name: 'estado',
    required: false,
    description: 'Filtrar por estado',
  })
  @ApiQuery({
    name: 'plantaId',
    required: false,
    description: 'Filtrar por planta',
  })
  @ApiResponse({
    status: 200,
    description: 'Excel generado exitosamente',
  })
  async exportRequirementsExcel(
    @Query('estado') estado?: string,
    @Query('plantaId') plantaId?: string,
    @Res({ passthrough: true }) res?: Response,
  ) {
    const filters: any = {};
    if (estado) filters.estado = estado;
    if (plantaId) filters.plantaId = plantaId;

    const excelBuffer =
      await this.exportsService.exportRequirementsExcel(filters);

    const filename = `requerimientos-${format(new Date(), 'yyyy-MM-dd-HHmm')}.xlsx`;

    res!.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': excelBuffer.length,
    });

    return new StreamableFile(excelBuffer);
  }

  /**
   * Exportar muestras a Excel
   */
  @Get('samples/excel')
  @Header(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  @ApiOperation({
    summary: 'Exportar Muestras a Excel',
    description: 'Genera un archivo Excel con la lista de todas las muestras',
  })
  @ApiQuery({
    name: 'estado',
    required: false,
    description: 'Filtrar por estado',
  })
  @ApiQuery({
    name: 'requirementId',
    required: false,
    description: 'Filtrar por requerimiento',
  })
  @ApiResponse({
    status: 200,
    description: 'Excel generado exitosamente',
  })
  async exportSamplesExcel(
    @Query('estado') estado?: string,
    @Query('requirementId') requirementId?: string,
    @Res({ passthrough: true }) res?: Response,
  ) {
    const filters: any = {};
    if (estado) filters.estado = estado;
    if (requirementId) filters.requirementId = requirementId;

    const excelBuffer = await this.exportsService.exportSamplesExcel(filters);

    const filename = `muestras-${format(new Date(), 'yyyy-MM-dd-HHmm')}.xlsx`;

    res!.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': excelBuffer.length,
    });

    return new StreamableFile(excelBuffer);
  }

  /**
   * Exportar análisis específico a PDF
   */
  @Get('analysis/:id/pdf')
  @Header('Content-Type', 'application/pdf')
  @ApiOperation({
    summary: 'Exportar Análisis a PDF',
    description:
      'Genera un reporte PDF con los resultados de un análisis específico',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID del análisis',
  })
  @ApiResponse({
    status: 200,
    description: 'PDF generado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Análisis no encontrado',
  })
  async exportAnalysisPDF(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const pdfBuffer = await this.exportsService.exportAnalysisPDF(id);

    const filename = `analisis-${id}-${format(new Date(), 'yyyy-MM-dd-HHmm')}.pdf`;

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': pdfBuffer.length,
    });

    return new StreamableFile(pdfBuffer);
  }
}
