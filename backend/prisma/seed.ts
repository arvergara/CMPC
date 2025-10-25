import { PrismaClient, UserRole, AnalysisStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');

  // Clear existing data
  console.log('🗑️  Clearing existing data...');
  await prisma.qREvent.deleteMany();
  await prisma.analysis.deleteMany();
  await prisma.storage.deleteMany();
  await prisma.sample.deleteMany();
  await prisma.requirement.deleteMany();
  await prisma.analysisType.deleteMany();
  await prisma.user.deleteMany();
  await prisma.planta.deleteMany();
  console.log('✅ Existing data cleared\n');

  // ============================================
  // 1. PLANTAS
  // ============================================
  console.log('🏭 Creating plants...');
  const plantaLaja = await prisma.planta.create({
    data: {
      nombre: 'Planta Laja',
      codigo: 'LAJ-01',
      ubicacion: 'Laja, Región del Biobío',
    },
  });

  const plantaPacífico = await prisma.planta.create({
    data: {
      nombre: 'Planta Pacífico',
      codigo: 'PAC-01',
      ubicacion: 'Nacimiento, Región del Biobío',
    },
  });

  const plantaSantaFe = await prisma.planta.create({
    data: {
      nombre: 'Planta Santa Fe',
      codigo: 'SFE-01',
      ubicacion: 'Nacimiento, Región del Biobío',
    },
  });

  console.log(`✅ Created ${3} plants\n`);

  // ============================================
  // 2. USERS
  // ============================================
  console.log('👥 Creating users...');
  const hashedPassword = await bcrypt.hash('password123', 10);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@cmpc.cl',
      passwordHash: hashedPassword,
      nombre: 'Administrador LIMS',
      rol: UserRole.ADMIN,
    },
  });

  const investigador1 = await prisma.user.create({
    data: {
      email: 'maria.gonzalez@cmpc.cl',
      passwordHash: hashedPassword,
      nombre: 'María González',
      rol: UserRole.INVESTIGADOR,
      plantaId: plantaLaja.id,
    },
  });

  const investigador2 = await prisma.user.create({
    data: {
      email: 'pedro.silva@cmpc.cl',
      passwordHash: hashedPassword,
      nombre: 'Pedro Silva',
      rol: UserRole.INVESTIGADOR,
      plantaId: plantaPacífico.id,
    },
  });

  const tecnico1 = await prisma.user.create({
    data: {
      email: 'ana.martinez@cmpc.cl',
      passwordHash: hashedPassword,
      nombre: 'Ana Martínez',
      rol: UserRole.LABORATORISTA,
      plantaId: plantaLaja.id,
    },
  });

  const tecnico2 = await prisma.user.create({
    data: {
      email: 'carlos.rodriguez@cmpc.cl',
      passwordHash: hashedPassword,
      nombre: 'Carlos Rodríguez',
      rol: UserRole.LABORATORISTA,
      plantaId: plantaPacífico.id,
    },
  });

  const jefelab = await prisma.user.create({
    data: {
      email: 'lucia.fernandez@cmpc.cl',
      passwordHash: hashedPassword,
      nombre: 'Lucía Fernández',
      rol: UserRole.JEFE_LAB,
    },
  });

  console.log(`✅ Created ${6} users (password: password123)\n`);

  // ============================================
  // 3. ANALYSIS TYPES
  // ============================================
  console.log('🔬 Creating analysis types...');

  const analisisCelulosa = await prisma.analysisType.create({
    data: {
      nombre: 'Análisis de Celulosa',
      descripcion: 'Determinación del contenido de celulosa en pulpa kraft',
      metodo: 'TAPPI T203',
      tiempoEstimadoHoras: 24,
      equiposRequeridos: ['Espectrofotómetro', 'Baño María'],
    },
  });

  const analisisHumedad = await prisma.analysisType.create({
    data: {
      nombre: 'Análisis de Humedad',
      descripcion: 'Determinación de contenido de humedad',
      metodo: 'TAPPI T412',
      tiempoEstimadoHoras: 4,
      equiposRequeridos: ['Balanza analítica', 'Horno de secado'],
    },
  });

  const analisisResistencia = await prisma.analysisType.create({
    data: {
      nombre: 'Análisis de Resistencia',
      descripcion: 'Pruebas de resistencia mecánica de papel',
      metodo: 'TAPPI T404',
      tiempoEstimadoHoras: 8,
      equiposRequeridos: ['Tensiómetro', 'Probeta de tracción'],
    },
  });

  const analisisBrillo = await prisma.analysisType.create({
    data: {
      nombre: 'Análisis de Blancura',
      descripcion: 'Medición de blancura y brillo ISO',
      metodo: 'ISO 2470',
      tiempoEstimadoHoras: 2,
      equiposRequeridos: ['Espectrofotómetro de reflectancia'],
    },
  });

  const analisisKappa = await prisma.analysisType.create({
    data: {
      nombre: 'Número Kappa',
      descripcion: 'Determinación del número Kappa en pulpa',
      metodo: 'TAPPI T236',
      tiempoEstimadoHoras: 6,
      equiposRequeridos: ['Bureta', 'Agitador magnético'],
    },
  });

  console.log(`✅ Created ${5} analysis types\n`);

  // ============================================
  // 4. COMPLETE WORKFLOW EXAMPLES
  // ============================================
  console.log('📋 Creating workflow examples...\n');

  // --- Workflow 1: Completed Analysis ---
  console.log('  Creating completed workflow example...');

  const req1 = await prisma.requirement.create({
    data: {
      codigo: 'REQ-2025-000001',
      investigadorId: investigador1.id,
      plantaId: plantaLaja.id,
      tipoMuestra: 'Pulpa Kraft Blanqueada',
      cantidadEsperada: 3,
      descripcion: 'Control de calidad mensual - Enero 2025',
      estado: 'COMPLETADO',
      fechaSolicitud: new Date('2025-01-05'),
    },
  });

  const sample1 = await prisma.sample.create({
    data: {
      codigoQR: 'QR-2025-000001',
      requirementId: req1.id,
      tipo: 'Pulpa Kraft Blanqueada',
      formato: 'Hoja',
      cantidad: '500g',
      estado: 'ANALISIS_COMPLETO',
      fechaRecepcion: new Date('2025-01-06'),
      fechaAnalisisInicio: new Date('2025-01-07'),
      fechaAnalisisFin: new Date('2025-01-09'),
      observaciones: 'Muestra en perfectas condiciones',
    },
  });

  await prisma.storage.create({
    data: {
      sampleId: sample1.id,
      ubicacionFisica: 'Bodega Laboratorio Central',
      estanteria: 'EST-A-01',
      caja: 'CAJA-2025-01',
      posicion: 'A1',
      estado: 'OCUPADA',
      fechaVencimientoEstimada: new Date('2026-01-09'),
    },
  });

  await prisma.analysis.create({
    data: {
      sampleId: sample1.id,
      tipoAnalisisId: analisisCelulosa.id,
      responsableId: tecnico1.id,
      estado: AnalysisStatus.COMPLETADO,
      fechaInicio: new Date('2025-01-07T08:00:00'),
      fechaFin: new Date('2025-01-08T16:00:00'),
      resultadosJson: {
        celulosa_alfa: 92.5,
        celulosa_beta: 6.2,
        celulosa_gamma: 1.3,
        unidad: 'porcentaje',
        temperatura: 23,
        humedad_relativa: 65,
        metodo: 'TAPPI T203',
        observaciones: 'Resultados dentro de especificaciones',
        aprobado: true,
      },
      archivoPdfUrl: 'https://storage.cmpc.cl/reports/2025/01/REQ-000001-CELULOSA.pdf',
      observaciones: 'Análisis completado sin anomalías',
    },
  });

  await prisma.qREvent.create({
    data: {
      sampleId: sample1.id,
      usuarioId: tecnico1.id,
      tipoEvento: 'RECEIVED',
      ubicacion: 'Laboratorio Central - Recepción',
      timestamp: new Date('2025-01-06T09:30:00'),
    },
  });

  console.log('  ✅ Completed workflow created\n');

  // --- Workflow 2: In Progress Analysis ---
  console.log('  Creating in-progress workflow example...');

  const req2 = await prisma.requirement.create({
    data: {
      codigo: 'REQ-2025-000002',
      investigadorId: investigador2.id,
      plantaId: plantaPacífico.id,
      tipoMuestra: 'Papel Tissue',
      cantidadEsperada: 5,
      descripcion: 'Pruebas de resistencia para nuevo producto',
      estado: 'EN_PROCESO',
      fechaSolicitud: new Date('2025-01-15'),
    },
  });

  const sample2 = await prisma.sample.create({
    data: {
      codigoQR: 'QR-2025-000002',
      requirementId: req2.id,
      tipo: 'Papel Tissue',
      formato: 'Rollo',
      cantidad: '1kg',
      estado: 'EN_ANALISIS',
      fechaRecepcion: new Date('2025-01-16'),
      fechaAnalisisInicio: new Date('2025-01-17'),
      observaciones: 'Muestra para desarrollo de nuevo producto',
    },
  });

  await prisma.analysis.create({
    data: {
      sampleId: sample2.id,
      tipoAnalisisId: analisisResistencia.id,
      responsableId: tecnico2.id,
      estado: AnalysisStatus.EN_PROCESO,
      fechaInicio: new Date('2025-01-17T10:00:00'),
      observaciones: 'Análisis en progreso',
    },
  });

  console.log('  ✅ In-progress workflow created\n');

  // --- Workflow 3: Pending Samples ---
  console.log('  Creating pending workflow example...');

  const req3 = await prisma.requirement.create({
    data: {
      codigo: 'REQ-2025-000003',
      investigadorId: investigador1.id,
      plantaId: plantaLaja.id,
      tipoMuestra: 'Pulpa Mecánica',
      cantidadEsperada: 2,
      descripcion: 'Análisis de rutina - Control de calidad',
      estado: 'DRAFT',
      fechaSolicitud: new Date('2025-01-20'),
    },
  });

  const sample3 = await prisma.sample.create({
    data: {
      codigoQR: 'QR-2025-000003',
      requirementId: req3.id,
      tipo: 'Pulpa Mecánica',
      formato: 'Hoja',
      cantidad: '300g',
      estado: 'RECIBIDA',
      fechaRecepcion: new Date('2025-01-21'),
      observaciones: 'Pendiente asignación de análisis',
    },
  });

  const sample4 = await prisma.sample.create({
    data: {
      codigoQR: 'QR-2025-000004',
      requirementId: req3.id,
      tipo: 'Pulpa Mecánica',
      formato: 'Hoja',
      cantidad: '300g',
      estado: 'ESPERADA',
      observaciones: 'Muestra aún no recibida',
    },
  });

  await prisma.analysis.create({
    data: {
      sampleId: sample3.id,
      tipoAnalisisId: analisisHumedad.id,
      estado: AnalysisStatus.PENDIENTE,
      observaciones: 'Pendiente de inicio',
    },
  });

  await prisma.analysis.create({
    data: {
      sampleId: sample3.id,
      tipoAnalisisId: analisisBrillo.id,
      estado: AnalysisStatus.PENDIENTE,
      observaciones: 'Pendiente de inicio',
    },
  });

  console.log('  ✅ Pending workflow created\n');

  // ============================================
  // SUMMARY
  // ============================================
  console.log('📊 Seed Summary:');
  console.log('================');
  console.log(`🏭 Plants: 3`);
  console.log(`👥 Users: 6`);
  console.log(`   - Admins: 1`);
  console.log(`   - Investigators: 2`);
  console.log(`   - Lab Technicians: 2`);
  console.log(`   - Lab Chiefs: 1`);
  console.log(`🔬 Analysis Types: 5`);
  console.log(`📋 Requirements: 3`);
  console.log(`🧪 Samples: 4`);
  console.log(`📈 Analysis: 5 (1 completed, 1 in-progress, 3 pending)`);
  console.log(`📦 Storage Locations: 1`);
  console.log(`📱 QR Events: 1`);
  console.log('\n✅ Database seeded successfully!\n');
  console.log('🔑 Login credentials for all users:');
  console.log('   Email: See above | Password: password123\n');
  console.log('💡 Quick start:');
  console.log('   - Admin: admin@cmpc.cl');
  console.log('   - Investigator: maria.gonzalez@cmpc.cl');
  console.log('   - Lab Tech: ana.martinez@cmpc.cl');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
