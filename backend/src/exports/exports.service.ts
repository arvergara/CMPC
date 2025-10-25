import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as ExcelJS from 'exceljs';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

@Injectable()
export class ExportsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Exporta el dashboard con KPIs a PDF
   */
  async exportDashboardPDF(): Promise<Buffer> {
    // Obtener datos del dashboard
    const [
      requirementsCount,
      samplesCount,
      analysisCount,
      storageCount,
      pendingRequirements,
      pendingSamples,
      pendingAnalysis,
    ] = await Promise.all([
      this.prisma.requirement.count(),
      this.prisma.sample.count(),
      this.prisma.analysis.count(),
      this.prisma.storage.count(),
      this.prisma.requirement.count({
        where: { estado: { in: ['DRAFT', 'ENVIADO'] } },
      }),
      this.prisma.sample.count({
        where: { estado: { in: ['ESPERADA', 'RECIBIDA'] } },
      }),
      this.prisma.analysis.count({
        where: { estado: { in: ['PENDIENTE', 'EN_PROCESO'] } },
      }),
    ]);

    // Crear PDF
    const doc = new jsPDF();

    // Título
    doc.setFontSize(20);
    doc.text('CMPC LIMS - Dashboard Report', 15, 20);

    // Fecha
    doc.setFontSize(10);
    const fecha = format(new Date(), "dd 'de' MMMM 'de' yyyy, HH:mm", {
      locale: es,
    });
    doc.text(`Fecha: ${fecha}`, 15, 30);

    // Tabla de KPIs
    autoTable(doc, {
      startY: 40,
      head: [['Métrica', 'Total', 'Pendientes']],
      body: [
        ['Requerimientos', requirementsCount.toString(), pendingRequirements.toString()],
        ['Muestras', samplesCount.toString(), pendingSamples.toString()],
        ['Análisis', analysisCount.toString(), pendingAnalysis.toString()],
        ['Almacenamiento', storageCount.toString(), '-'],
      ],
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] },
    });

    // Obtener actividad reciente
    const recentSamples = await this.prisma.sample.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        requirement: {
          select: {
            codigo: true,
          },
        },
      },
    });

    // Tabla de actividad reciente
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 15,
      head: [['Código QR', 'Requerimiento', 'Estado', 'Fecha']],
      body: recentSamples.map((sample) => [
        sample.codigoQR,
        sample.requirement.codigo,
        sample.estado,
        format(new Date(sample.createdAt), 'dd/MM/yyyy'),
      ]),
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] },
    });

    // Footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(
        `Página ${i} de ${pageCount}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' },
      );
    }

    return Buffer.from(doc.output('arraybuffer'));
  }

  /**
   * Exporta lista de requerimientos a Excel
   */
  async exportRequirementsExcel(filters?: any): Promise<Buffer> {
    const requirements = await this.prisma.requirement.findMany({
      where: filters,
      include: {
        investigador: {
          select: {
            nombre: true,
            email: true,
          },
        },
        planta: {
          select: {
            nombre: true,
          },
        },
        laboratorioAsignado: {
          select: {
            nombre: true,
          },
        },
        samples: {
          select: {
            codigoQR: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Requerimientos');

    // Encabezados
    worksheet.columns = [
      { header: 'Código', key: 'codigo', width: 15 },
      { header: 'Investigador', key: 'investigador', width: 25 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Planta', key: 'planta', width: 20 },
      { header: 'Laboratorio', key: 'laboratorio', width: 20 },
      { header: 'Estado', key: 'estado', width: 15 },
      { header: 'Muestras', key: 'muestras', width: 10 },
      { header: 'Fecha Creación', key: 'fechaCreacion', width: 15 },
    ];

    // Estilo de encabezados
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2980B9' },
    };
    worksheet.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };

    // Datos
    requirements.forEach((req) => {
      worksheet.addRow({
        codigo: req.codigo,
        investigador: req.investigador.nombre,
        email: req.investigador.email,
        planta: req.planta?.nombre || 'N/A',
        laboratorio: req.laboratorioAsignado?.nombre || 'N/A',
        estado: req.estado,
        muestras: req.samples.length,
        fechaCreacion: format(new Date(req.createdAt), 'dd/MM/yyyy'),
      });
    });

    // Autoajustar filas
    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
      });
    });

    return Buffer.from(await workbook.xlsx.writeBuffer());
  }

  /**
   * Exporta lista de muestras a Excel
   */
  async exportSamplesExcel(filters?: any): Promise<Buffer> {
    const samples = await this.prisma.sample.findMany({
      where: filters,
      include: {
        requirement: {
          select: {
            codigo: true,
            investigador: {
              select: {
                nombre: true,
              },
            },
          },
        },
        storage: {
          select: {
            ubicacionFisica: true,
            estanteria: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Muestras');

    // Encabezados
    worksheet.columns = [
      { header: 'Código QR', key: 'codigoQR', width: 20 },
      { header: 'Requerimiento', key: 'requerimiento', width: 15 },
      { header: 'Investigador', key: 'investigador', width: 25 },
      { header: 'Tipo', key: 'tipo', width: 20 },
      { header: 'Estado', key: 'estado', width: 15 },
      { header: 'Ubicación', key: 'ubicacion', width: 20 },
      { header: 'Estantería', key: 'estanteria', width: 15 },
      { header: 'Fecha Recepción', key: 'fechaRecepcion', width: 15 },
    ];

    // Estilo de encabezados
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2980B9' },
    };
    worksheet.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };

    // Datos
    samples.forEach((sample) => {
      worksheet.addRow({
        codigoQR: sample.codigoQR,
        requerimiento: sample.requirement.codigo,
        investigador: sample.requirement.investigador.nombre,
        tipo: sample.tipo,
        estado: sample.estado,
        ubicacion: sample.storage?.ubicacionFisica || 'N/A',
        estanteria: sample.storage?.estanteria || 'N/A',
        fechaRecepcion: sample.fechaRecepcion
          ? format(new Date(sample.fechaRecepcion), 'dd/MM/yyyy')
          : 'N/A',
      });
    });

    // Autoajustar filas
    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
      });
    });

    return Buffer.from(await workbook.xlsx.writeBuffer());
  }

  /**
   * Exporta resultados de un análisis específico a PDF
   */
  async exportAnalysisPDF(analysisId: string): Promise<Buffer> {
    const analysis = await this.prisma.analysis.findUnique({
      where: { id: analysisId },
      include: {
        tipoAnalisis: true,
        sample: {
          include: {
            requirement: {
              include: {
                investigador: {
                  select: {
                    nombre: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
        responsable: {
          select: {
            nombre: true,
            email: true,
          },
        },
      },
    });

    if (!analysis) {
      throw new Error('Análisis no encontrado');
    }

    // Crear PDF
    const doc = new jsPDF();

    // Título
    doc.setFontSize(20);
    doc.text('CMPC LIMS - Resultados de Análisis', 15, 20);

    // Información del análisis
    doc.setFontSize(12);
    doc.text('Información General', 15, 35);

    autoTable(doc, {
      startY: 40,
      head: [['Campo', 'Valor']],
      body: [
        ['Tipo de Análisis', analysis.tipoAnalisis.nombre],
        ['Muestra (QR)', analysis.sample.codigoQR],
        [
          'Requerimiento',
          `${analysis.sample.requirement.codigo} - ${analysis.sample.requirement.investigador.nombre}`,
        ],
        ['Responsable', analysis.responsable?.nombre || 'N/A'],
        ['Estado', analysis.estado],
        [
          'Fecha Inicio',
          analysis.fechaInicio
            ? format(new Date(analysis.fechaInicio), 'dd/MM/yyyy HH:mm')
            : 'N/A',
        ],
        [
          'Fecha Fin',
          analysis.fechaFin
            ? format(new Date(analysis.fechaFin), 'dd/MM/yyyy HH:mm')
            : 'N/A',
        ],
      ],
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] },
    });

    // Resultados
    if (analysis.resultadosJson) {
      doc.text('Resultados', 15, (doc as any).lastAutoTable.finalY + 15);

      try {
        const resultados =
          typeof analysis.resultadosJson === 'string'
            ? JSON.parse(analysis.resultadosJson)
            : analysis.resultadosJson;

        autoTable(doc, {
          startY: (doc as any).lastAutoTable.finalY + 20,
          head: [['Parámetro', 'Valor', 'Unidad']],
          body: Object.entries(resultados).map(([key, value]: [string, any]) => [
            key,
            value?.valor || value || '-',
            value?.unidad || '-',
          ]),
          theme: 'grid',
          headStyles: { fillColor: [41, 128, 185] },
        });
      } catch (e) {
        doc.text(
          'Error al parsear resultados JSON',
          15,
          (doc as any).lastAutoTable.finalY + 20,
        );
      }
    }

    // Observaciones
    if (analysis.observaciones) {
      doc.text('Observaciones', 15, (doc as any).lastAutoTable.finalY + 15);
      doc.setFontSize(10);
      const lines = doc.splitTextToSize(
        analysis.observaciones,
        doc.internal.pageSize.width - 30,
      );
      doc.text(lines, 15, (doc as any).lastAutoTable.finalY + 20);
    }

    // Footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(
        `Página ${i} de ${pageCount} - Generado el ${format(new Date(), 'dd/MM/yyyy HH:mm')}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' },
      );
    }

    return Buffer.from(doc.output('arraybuffer'));
  }
}
