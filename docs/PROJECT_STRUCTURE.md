# 📁 Estructura del Proyecto CMPC LIMS

Este documento describe la organización del código y las convenciones utilizadas en el proyecto.

## 🏗️ Arquitectura General

```
cmpc-lims/
├── backend/              # API NestJS
├── frontend/             # React PWA
├── shared/               # Código compartido (tipos, constantes)
├── docker/               # Configuración Docker
├── docs/                 # Documentación
├── .prettierrc           # Configuración Prettier
├── .gitignore            # Git ignore global
└── package.json          # Root workspace config
```

## 🔙 Backend Structure

```
backend/
├── prisma/
│   ├── schema.prisma           # Schema de base de datos
│   ├── migrations/             # Migraciones SQL
│   └── seed.ts                 # Datos iniciales
│
├── src/
│   ├── main.ts                 # Entry point
│   ├── app.module.ts           # Módulo raíz
│   │
│   ├── auth/                   # Módulo de autenticación
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── strategies/         # JWT, Local strategies
│   │   └── dto/                # Data Transfer Objects
│   │
│   ├── requirements/           # Módulo de requerimientos
│   │   ├── requirements.module.ts
│   │   ├── requirements.controller.ts
│   │   ├── requirements.service.ts
│   │   ├── dto/
│   │   └── entities/
│   │
│   ├── samples/                # Módulo de muestras
│   │   ├── samples.module.ts
│   │   ├── samples.controller.ts
│   │   ├── samples.service.ts
│   │   ├── dto/
│   │   └── entities/
│   │
│   ├── qr/                     # Sistema QR
│   │   ├── qr.module.ts
│   │   ├── qr.service.ts
│   │   └── qr.controller.ts
│   │
│   ├── storage/                # Gestión de bodega
│   ├── analysis/               # Análisis
│   ├── audit/                  # Logs de auditoría
│   ├── dashboard/              # KPIs y reportes
│   ├── admin/                  # Administración
│   │
│   ├── common/                 # Código compartido
│   │   ├── prisma/
│   │   │   ├── prisma.module.ts
│   │   │   └── prisma.service.ts
│   │   ├── guards/             # Auth guards
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── roles.guard.ts
│   │   ├── decorators/         # Custom decorators
│   │   │   ├── roles.decorator.ts
│   │   │   └── current-user.decorator.ts
│   │   ├── filters/            # Exception filters
│   │   ├── interceptors/       # Interceptors
│   │   └── pipes/              # Validation pipes
│   │
│   └── config/                 # Configuración
│       └── configuration.ts
│
├── test/
│   ├── unit/                   # Tests unitarios
│   └── e2e/                    # Tests E2E
│
├── .env.example                # Ejemplo de variables de entorno
├── .eslintrc.js                # Configuración ESLint
├── nest-cli.json               # Configuración Nest CLI
├── tsconfig.json               # Configuración TypeScript
└── package.json
```

### Convenciones Backend

#### Naming Conventions

- **Módulos:** `nombre.module.ts`
- **Controladores:** `nombre.controller.ts`
- **Servicios:** `nombre.service.ts`
- **DTOs:** `create-nombre.dto.ts`, `update-nombre.dto.ts`
- **Entities:** `nombre.entity.ts`
- **Guards:** `nombre.guard.ts`
- **Decorators:** `nombre.decorator.ts`

#### Estructura de Módulos

```typescript
// nombre.module.ts
import { Module } from '@nestjs/common';
import { NombreController } from './nombre.controller';
import { NombreService } from './nombre.service';

@Module({
  imports: [],
  controllers: [NombreController],
  providers: [NombreService],
  exports: [NombreService],
})
export class NombreModule {}
```

#### DTOs con Validación

```typescript
// create-sample.dto.ts
import { IsString, IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSampleDto {
  @ApiProperty({ description: 'ID del requerimiento' })
  @IsUUID()
  @IsNotEmpty()
  requirementId: string;

  @ApiProperty({ description: 'Tipo de muestra' })
  @IsString()
  @IsNotEmpty()
  tipo: string;
}
```

## ⚛️ Frontend Structure

```
frontend/
├── public/
│   ├── favicon.ico
│   └── manifest.json
│
├── src/
│   ├── main.tsx                # Entry point
│   ├── App.tsx                 # Root component
│   │
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   └── ...
│   │   │
│   │   ├── layout/             # Layout components
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── MainLayout.tsx
│   │   │
│   │   ├── requirements/       # Componentes de requerimientos
│   │   ├── samples/            # Componentes de muestras
│   │   ├── qr/                 # Componentes QR
│   │   ├── storage/            # Componentes de bodega
│   │   ├── analysis/           # Componentes de análisis
│   │   ├── dashboard/          # Componentes de dashboard
│   │   └── admin/              # Componentes de admin
│   │
│   ├── pages/                  # Páginas (rutas)
│   │   ├── LoginPage.tsx
│   │   ├── RequirementsPage.tsx
│   │   ├── SamplesPage.tsx
│   │   └── ...
│   │
│   ├── hooks/                  # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useSamples.ts
│   │   └── useQRScanner.ts
│   │
│   ├── services/               # API clients
│   │   ├── api.ts              # Axios config
│   │   ├── auth.service.ts
│   │   ├── samples.service.ts
│   │   └── ...
│   │
│   ├── stores/                 # Zustand stores
│   │   ├── authStore.ts
│   │   └── uiStore.ts
│   │
│   ├── types/                  # TypeScript types
│   │   ├── sample.types.ts
│   │   ├── requirement.types.ts
│   │   └── ...
│   │
│   ├── lib/                    # Utilidades
│   │   ├── utils.ts            # cn() y otras utils
│   │   └── constants.ts
│   │
│   ├── assets/                 # Imágenes, iconos
│   │
│   └── styles/
│       └── index.css           # Estilos globales + Tailwind
│
├── .env.example
├── .eslintrc.cjs
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── vite.config.ts
└── package.json
```

### Convenciones Frontend

#### Naming Conventions

- **Components:** PascalCase (`SampleCard.tsx`)
- **Hooks:** camelCase con `use` prefix (`useSamples.ts`)
- **Services:** camelCase con `.service` suffix (`auth.service.ts`)
- **Stores:** camelCase con `Store` suffix (`authStore.ts`)
- **Types:** PascalCase con `.types` suffix (`Sample.types.ts`)
- **Utilities:** camelCase (`utils.ts`)

#### Component Structure

```typescript
// SampleCard.tsx
import { cn } from '@/lib/utils';

interface SampleCardProps {
  sample: Sample;
  onEdit?: (id: string) => void;
}

export function SampleCard({ sample, onEdit }: SampleCardProps) {
  return (
    <div className={cn('rounded-lg border p-4')}>
      {/* Component content */}
    </div>
  );
}
```

#### Custom Hooks

```typescript
// useSamples.ts
import { useQuery, useMutation } from '@tanstack/react-query';
import { samplesService } from '@/services/samples.service';

export function useSamples() {
  const query = useQuery({
    queryKey: ['samples'],
    queryFn: samplesService.getAll,
  });

  const createMutation = useMutation({
    mutationFn: samplesService.create,
    onSuccess: () => {
      query.refetch();
    },
  });

  return {
    samples: query.data,
    isLoading: query.isLoading,
    createSample: createMutation.mutate,
  };
}
```

#### Zustand Store

```typescript
// authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      login: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
```

## 🗄️ Shared Structure

```
shared/
├── src/
│   ├── types/              # Tipos compartidos
│   │   ├── user.types.ts
│   │   ├── sample.types.ts
│   │   └── ...
│   │
│   ├── constants/          # Constantes compartidas
│   │   ├── roles.ts
│   │   ├── status.ts
│   │   └── ...
│   │
│   └── utils/              # Utilidades compartidas
│       └── validators.ts
│
└── package.json
```

## 📝 Convenciones Generales

### Commits

Usar Conventional Commits:

```
feat(samples): add QR code generation
fix(auth): resolve token expiration issue
docs(readme): update installation steps
style(frontend): format with prettier
refactor(backend): optimize database queries
test(samples): add unit tests for service
chore(deps): update dependencies
```

### Pull Requests

Plantilla de PR:

```markdown
## Descripción
Breve descripción de los cambios

## Tipo de cambio
- [ ] Bug fix
- [ ] Nueva feature
- [ ] Breaking change
- [ ] Documentación

## Testing
- [ ] Tests unitarios agregados/actualizados
- [ ] Tests E2E agregados/actualizados
- [ ] Probado manualmente

## Checklist
- [ ] Mi código sigue las convenciones del proyecto
- [ ] He realizado self-review
- [ ] He comentado código complejo
- [ ] He actualizado la documentación
- [ ] Mis cambios no generan warnings
- [ ] Tests pasan localmente
```

### Code Review Guidelines

1. **Funcionalidad:** ¿El código hace lo que debe hacer?
2. **Tests:** ¿Hay tests suficientes?
3. **Rendimiento:** ¿Hay problemas de performance?
4. **Seguridad:** ¿Hay vulnerabilidades?
5. **Mantenibilidad:** ¿Es fácil de entender y modificar?
6. **Consistencia:** ¿Sigue las convenciones del proyecto?

## 🎨 Estilos de Código

### TypeScript

- Usar `interface` para objetos, `type` para unions/intersections
- Evitar `any`, usar `unknown` si es necesario
- Preferir `const` sobre `let`
- Usar optional chaining (`?.`) y nullish coalescing (`??`)

### React

- Componentes funcionales con hooks
- Props destructuring
- Evitar props drilling (usar context/stores)
- Memoizar componentes pesados con `memo`

### CSS/Tailwind

- Mobile-first approach
- Usar variables CSS de shadcn/ui
- Preferir Tailwind sobre CSS custom
- Agrupar clases con `cn()` helper

## 📊 Métricas de Calidad

### Objetivos

- **Test Coverage:** >80%
- **TypeScript Strict:** Habilitado
- **ESLint Warnings:** 0
- **Build Time:** <2 min
- **Bundle Size:** <500kb (frontend)

---

**Última actualización:** 2024
