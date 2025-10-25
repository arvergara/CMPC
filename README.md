# CMPC LIMS - Sistema de Gestión de Muestras de Laboratorio

Sistema completo de gestión de muestras de laboratorio desarrollado para CMPC (Compañía Manufacturera de Papeles y Cartones).

## 📋 Descripción del Proyecto

Sistema diseñado para reemplazar Monday.com con una solución personalizada que proporciona:

- ✅ Trazabilidad completa mediante códigos QR
- ✅ Formulario inteligente de requerimientos
- ✅ Gestión de almacenamiento automatizada
- ✅ Reducción de 70-80% en errores de vinculación
- ✅ Reducción de 40-50% en tiempos de procesamiento

### Alcance del Sistema

- **Plantas:** 3 ubicaciones
- **Usuarios:** 60 usuarios
- **Volumen:** 1,000 muestras/mes
- **Plazo:** 3 meses de desarrollo
- **Presupuesto:** UF 280 (+ IVA)

## 🏗️ Arquitectura

```
cmpc-lims/
├── backend/          # API NestJS + PostgreSQL + Prisma
├── frontend/         # React PWA + TypeScript + Tailwind
├── shared/           # Tipos compartidos
├── docker/           # Docker Compose para desarrollo
└── docs/             # Documentación técnica
```

## 🚀 Stack Tecnológico

### Backend
- **Framework:** NestJS + TypeScript
- **Base de Datos:** PostgreSQL 16
- **ORM:** Prisma
- **Cache:** Redis
- **Autenticación:** JWT + Passport
- **Documentación:** Swagger/OpenAPI
- **Testing:** Jest + Supertest

### Frontend
- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **UI Framework:** Tailwind CSS + shadcn/ui
- **Estado:** Zustand
- **Routing:** React Router v6
- **Data Fetching:** TanStack Query
- **QR:** html5-qrcode
- **PWA:** Vite PWA Plugin

### Infraestructura
- **Containerización:** Docker + Docker Compose
- **CI/CD:** GitHub Actions (por configurar)
- **Hosting:** AWS/Azure (por definir)

## 📦 Instalación y Configuración

### Prerrequisitos

- Node.js 20+ LTS
- PostgreSQL 16
- Redis 7
- Docker & Docker Compose (recomendado)

### Instalación Rápida

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd cmpc-lims
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Iniciar servicios con Docker**
```bash
npm run docker:up
```

Esto iniciará:
- PostgreSQL en `localhost:5432`
- Redis en `localhost:6379`
- pgAdmin en `localhost:5050`
- Redis Commander en `localhost:8081`

4. **Configurar variables de entorno**

**Backend:**
```bash
cd backend
cp .env.example .env
# Editar .env con tus configuraciones
```

**Frontend:**
```bash
cd frontend
cp .env.example .env
# Editar .env con tus configuraciones
```

5. **Ejecutar migraciones de base de datos**
```bash
cd backend
npm run prisma:migrate
npm run prisma:generate
```

6. **Iniciar aplicación en modo desarrollo**
```bash
# Desde la raíz del proyecto
npm run dev
```

Esto iniciará:
- Backend: `http://localhost:3000`
- Frontend: `http://localhost:5173`
- API Docs: `http://localhost:3000/api/docs`

## 🛠️ Scripts Disponibles

### Raíz del Proyecto
```bash
npm run dev              # Iniciar backend + frontend
npm run build            # Construir todos los proyectos
npm run test             # Ejecutar tests
npm run lint             # Ejecutar linter
npm run format           # Formatear código con Prettier
npm run docker:up        # Iniciar servicios Docker
npm run docker:down      # Detener servicios Docker
```

### Backend
```bash
npm run dev              # Modo desarrollo con hot-reload
npm run build            # Construir para producción
npm run start:prod       # Iniciar en producción
npm run test             # Ejecutar tests unitarios
npm run test:e2e         # Ejecutar tests E2E
npm run prisma:generate  # Generar cliente Prisma
npm run prisma:migrate   # Ejecutar migraciones
npm run prisma:studio    # Abrir Prisma Studio
```

### Frontend
```bash
npm run dev              # Modo desarrollo
npm run build            # Construir para producción
npm run preview          # Preview de build
npm run test             # Ejecutar tests con Vitest
npm run test:ui          # UI de tests
npm run lint             # Ejecutar ESLint
```

## 📚 Módulos del Sistema

### 1. Módulo de Requerimientos
- Formulario dinámico de solicitud de análisis
- Asignación automática de laboratorios
- Historial de requerimientos por investigador

### 2. Módulo de Gestión de Muestras
- Generación de códigos QR únicos
- Impresión de etiquetas (Zebra ZD421)
- Escaneo y vinculación de muestras
- Gestión de contramuestras y derivadas
- Timeline de eventos

### 3. Módulo de Consulta de Resultados
- Búsqueda por código QR
- Descarga de resultados (PDF/Excel)
- Notificaciones de análisis completados

### 4. Módulo de Bodega
- Cola de muestras pendientes
- Asignación de ubicaciones
- Alertas de vencimiento
- Proceso de eliminación con aprobación

### 5. Módulo de Reporting y KPIs
- Dashboard en tiempo real
- 8 KPIs principales
- Exportación a PDF/Excel
- Gráficos interactivos

### 6. Módulo de Edición de Resultados
- Log de auditoría inmutable
- Justificación obligatoria
- Versionado de cambios
- Notificaciones a supervisores

### 7. Módulo de Administración
- Gestión de usuarios y roles
- Configuración de tipos de análisis
- Configuración de impresoras
- Maestros del sistema

## 🗄️ Estructura de Base de Datos

Principales entidades:
- **Users** - Usuarios del sistema con roles
- **Requirements** - Requerimientos de análisis
- **Samples** - Muestras (con QR único)
- **QREvents** - Timeline de eventos (inmutable)
- **Storage** - Almacenamiento en bodega
- **Analysis** - Análisis realizados
- **AuditLog** - Log de auditoría (inmutable)

Ver esquema completo en `backend/prisma/schema.prisma`

## 🔐 Seguridad

- Autenticación JWT con refresh tokens
- Passwords hasheados con bcrypt (12 rounds)
- Guards por rol y permisos granulares
- Rate limiting configurado
- Validación estricta de inputs
- Audit log completo para compliance
- Headers de seguridad (Helmet)
- CORS configurado

## 🧪 Testing

### Cobertura Objetivo: >80%

```bash
# Backend
cd backend
npm run test              # Unit tests
npm run test:cov          # Coverage report
npm run test:e2e          # E2E tests

# Frontend
cd frontend
npm run test              # Vitest
npm run test:ui           # UI interactiva
npm run test:coverage     # Coverage
```

## 📱 PWA (Progressive Web App)

El frontend está configurado como PWA para:
- Funcionamiento offline
- Instalación en dispositivos móviles
- Caché inteligente de recursos
- Service Workers configurados

## 🔧 Desarrollo

### Git Flow

```
main (producción)
  └── develop (desarrollo)
       ├── feature/nombre-feature
       ├── bugfix/nombre-bug
       └── hotfix/nombre-hotfix
```

### Conventional Commits

```bash
feat: nueva funcionalidad
fix: corrección de bug
docs: cambios en documentación
style: formateo de código
refactor: refactorización
test: agregar tests
chore: tareas de mantenimiento
```

### Code Review

- Pull requests obligatorios para merge a develop/main
- Al menos 1 aprobación requerida
- Tests deben pasar
- Coverage debe mantenerse >80%

## 📖 Documentación Adicional

- **API Documentation:** `http://localhost:3000/api/docs` (Swagger)
- **Especificación Técnica:** Ver `instructions.md`
- **Prisma Studio:** `npm run prisma:studio`

## 👥 Equipo

**Desarrollado por MAindset**
- **Tech Lead:** Andrés Vergara (andres.vergara@maindset.cl)
- **Cliente:** CMPC S.A.

## 📅 Cronograma

- **Semanas 1-2:** Análisis y Diseño ✓
- **Semanas 3-5:** Backend Core (en progreso)
- **Semanas 6-8:** Frontend Completo
- **Semana 9:** Migración desde Monday.com
- **Semana 10:** Testing y QA
- **Semanas 11-12:** Deploy y Capacitación

## 🐛 Soporte

- **Email:** soporte@maindset.cl
- **Issues:** GitHub Issues
- **Slack:** #proyecto-cmpc-lims

## 📄 Licencia

Propiedad de CMPC S.A. - Todos los derechos reservados.

---

**Estado del Proyecto:** 🟡 En Desarrollo - Semana 2

**Última Actualización:** 2024
