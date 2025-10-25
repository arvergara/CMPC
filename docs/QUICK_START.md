# 🚀 Guía de Inicio Rápido - CMPC LIMS

Esta guía te ayudará a tener el proyecto funcionando en menos de 10 minutos.

## ⚡ Setup Rápido (Desarrollo Local)

### 1. Verificar Prerrequisitos

```bash
node --version  # Debe ser v20.x o superior
docker --version
docker-compose --version
```

### 2. Instalar Dependencias

```bash
# Desde la raíz del proyecto
npm install
```

Esto instalará las dependencias de todos los workspaces (backend, frontend, shared).

### 3. Iniciar Servicios de Base de Datos

```bash
npm run docker:up
```

Esto iniciará:
- ✅ PostgreSQL (puerto 5432)
- ✅ Redis (puerto 6379)
- ✅ pgAdmin (puerto 5050)
- ✅ Redis Commander (puerto 8081)

**Verificar que los servicios estén corriendo:**
```bash
docker ps
```

### 4. Configurar Variables de Entorno

**Backend:**
```bash
cd backend
cp .env.example .env
```

El archivo `.env` por defecto ya está configurado para desarrollo local. Solo necesitas cambiar valores si usas configuraciones personalizadas.

**Frontend:**
```bash
cd ../frontend
cp .env.example .env
```

### 5. Configurar Base de Datos

```bash
cd ../backend

# Generar cliente Prisma
npm run prisma:generate

# Ejecutar migraciones
npm run prisma:migrate

# (Opcional) Abrir Prisma Studio para ver la BD
npm run prisma:studio
```

### 6. Iniciar la Aplicación

```bash
# Desde la raíz del proyecto
cd ..
npm run dev
```

Esto iniciará:
- 🔥 Backend en `http://localhost:3000`
- ⚛️ Frontend en `http://localhost:5173`

### 7. Verificar que Todo Funcione

Abre tu navegador:

1. **Frontend:** http://localhost:5173
   - Deberías ver la página de bienvenida de CMPC LIMS

2. **API Docs:** http://localhost:3000/api/docs
   - Swagger UI con toda la documentación de la API

3. **pgAdmin:** http://localhost:5050
   - Email: `admin@cmpc.cl`
   - Password: `admin`

4. **Redis Commander:** http://localhost:8081

## 🎯 Siguiente Pasos

### Crear tu Primer Usuario (Seed Data)

```bash
cd backend
npm run prisma:seed
```

Esto creará usuarios de ejemplo para cada rol:
- Admin
- Jefe de Laboratorio
- Laboratorista
- Bodeguero
- Investigador

### Explorar el Código

**Backend Structure:**
```
backend/src/
├── auth/           # Autenticación y autorización
├── requirements/   # Módulo de requerimientos
├── samples/        # Módulo de muestras
├── qr/             # Sistema QR
├── storage/        # Gestión de bodega
├── analysis/       # Análisis
├── audit/          # Logs de auditoría
├── dashboard/      # KPIs y reportes
├── admin/          # Administración
└── common/         # Utilidades compartidas
```

**Frontend Structure:**
```
frontend/src/
├── components/
│   ├── ui/         # Componentes shadcn/ui
│   ├── layout/     # Layout components
│   └── [modules]/  # Componentes por módulo
├── pages/          # Páginas de rutas
├── hooks/          # Custom hooks
├── services/       # API clients
├── stores/         # Zustand stores
└── types/          # TypeScript types
```

## 🔧 Comandos Útiles

### Durante Desarrollo

```bash
# Ver logs del backend
cd backend && npm run dev

# Ver logs del frontend
cd frontend && npm run dev

# Ejecutar tests
npm run test

# Formatear código
npm run format

# Verificar lint
npm run lint
```

### Base de Datos

```bash
# Crear nueva migración
cd backend
npm run prisma:migrate -- --name nombre_migracion

# Resetear base de datos (CUIDADO: borra todos los datos)
npx prisma migrate reset

# Ver datos en Prisma Studio
npm run prisma:studio
```

### Docker

```bash
# Ver logs de PostgreSQL
docker logs cmpc-lims-postgres

# Ver logs de Redis
docker logs cmpc-lims-redis

# Detener todos los servicios
npm run docker:down

# Reiniciar servicios
npm run docker:down && npm run docker:up
```

## 🐛 Solución de Problemas

### Error: "Port 3000 already in use"

```bash
# Encontrar proceso usando el puerto
lsof -i :3000

# Matar el proceso
kill -9 <PID>
```

### Error: "Cannot connect to PostgreSQL"

```bash
# Verificar que Docker esté corriendo
docker ps

# Reiniciar servicios
npm run docker:down
npm run docker:up

# Esperar 10 segundos y reintentar
```

### Error: "Prisma Client not generated"

```bash
cd backend
npm run prisma:generate
```

### Frontend no carga

```bash
# Limpiar caché y reinstalar
cd frontend
rm -rf node_modules dist
npm install
npm run dev
```

## 📚 Recursos Adicionales

- [Documentación NestJS](https://docs.nestjs.com)
- [Documentación Prisma](https://www.prisma.io/docs)
- [Documentación React](https://react.dev)
- [shadcn/ui Components](https://ui.shadcn.com)
- [TailwindCSS](https://tailwindcss.com/docs)

## 💡 Tips

1. **Hot Reload:** Tanto backend como frontend tienen hot reload. Los cambios se reflejan automáticamente.

2. **TypeScript:** El proyecto usa TypeScript estricto. Usa tipos siempre que sea posible.

3. **Prisma Studio:** Es tu mejor amigo para explorar y modificar datos durante desarrollo.

4. **API Docs:** Swagger se actualiza automáticamente. Úsalo para probar endpoints.

5. **Git Hooks:** Se recomienda configurar Husky para pre-commit hooks (por hacer).

## ✅ Checklist de Setup Completo

- [ ] Node.js 20+ instalado
- [ ] Docker Desktop corriendo
- [ ] Dependencias instaladas (`npm install`)
- [ ] Servicios Docker iniciados (`npm run docker:up`)
- [ ] Variables de entorno configuradas
- [ ] Migraciones ejecutadas
- [ ] Backend corriendo en :3000
- [ ] Frontend corriendo en :5173
- [ ] Puedes acceder a Swagger docs
- [ ] Puedes acceder a pgAdmin

¡Listo! Ya puedes empezar a desarrollar 🎉

---

**¿Necesitas ayuda?** Contacta a andres.vergara@maindset.cl
