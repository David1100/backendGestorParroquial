# AGENTS.md - Sistema de Gestión Parroquial

## Project Overview

Multi-parroquia management system with NestJS backend and Next.js frontend.

## Build Commands

### Backend (NestJS)
```bash
cd backend
npm run build          # Build production
npm run start          # Run production
npm run start:dev      # Dev with watch mode
npm run start:prod     # Run dist/main
npm run db:seed        # Seed database
```

### Frontend (Next.js)
```bash
cd frontend
npm run dev            # Development server (port 3000)
npm run build          # Production build
npm run start          # Run production
npm run lint           # Run Next.js lint
```

### Single Test
No test framework configured. To add tests, use Jest:
```bash
# Backend - add to package.json and run
npm install --save-dev jest @types/jest ts-jest
npx jest --testPathPattern=usuarios.service.spec.ts

# Frontend
npm install --save-dev @testing-library/react @testing-library/jest-dom
npx jest --testPathPattern=usuarios
```

## Code Style Guidelines

### TypeScript
- Use explicit types; avoid `any` when possible
- Enable strict null checks in tsconfig when feasible
- Use interfaces for DTOs and response types

### Backend (NestJS)

#### Module Structure
Each module follows: `module.controller.ts`, `module.service.ts`, `dto/`, `entities/`

#### Imports Order
1. NestJS core (`@nestjs/common`, `@nestjs/core`)
2. External libraries (Prisma, bcrypt, JWT)
3. Local modules (../prisma, ../auth)
4. DTOs and entities

#### Service Patterns
```typescript
@Injectable()
export class UsuariosService {
  constructor(private prisma: PrismaService) {}

  private isSuperAdmin(usuario: any): boolean {
    return usuario?.perfil?.nombre === 'Super Admin';
  }

  async findAll(parroquiaId: string, usuario: any) {
    // Filter by parish unless super admin
    if (!this.isSuperAdmin(usuario) && usuario.parroquiaId !== Number(parroquiaId)) {
      throw new ForbiddenException('No tienes acceso a esta parroquia');
    }
    // ...
  }
}
```

#### Error Handling
- Use NestJS exceptions: `NotFoundException`, `ForbiddenException`, `UnauthorizedException`
- Return meaningful Spanish error messages
- Always validate `parroquiaId` for multi-parroquia isolation

#### Guards & Decorators
Use `@Permission(modulo, accion)` decorator:
```typescript
@Permission('usuarios', 'crear')
@Controller('usuarios')
export class UsuariosController {}
```

### Frontend (Next.js)

#### File Structure
```
app/
  login/page.tsx
  dashboard/
    layout.tsx
    usuarios/page.tsx
    bautizos/page.tsx
components/
  Table.tsx
  Form.tsx
lib/
  auth-store.ts
  api.ts
  alerts.ts
```

#### Component Patterns
- Use `'use client'` for interactive components
- Use Zustand for global state (`@/lib/auth-store`)
- Use fetchAPI wrapper for HTTP calls
- Use framer-motion for animations
- Use SweetAlert2 for confirmations/alerts

#### State Management
```typescript
const { usuario, perfil, can } = useAuthStore();

// Permission check
if (!can('usuarios', 'ver')) return null;
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files | kebab-case | `usuarios.service.ts` |
| Classes | PascalCase | `UsuariosService` |
| Methods/vars | camelCase | `findAll()`, `parroquiaId` |
| Components | PascalCase | `UsuariosPage` |
| Constants | UPPER_SNAKE | `SUPER_ADMIN_PROFILE` |
| DTOs | PascalCase + DTO | `CreateUsuarioDto` |

### Database (Prisma)

- Use PrismaService for all DB operations
- Always filter queries by `parroquiaId` (except super admin)
- Include related entities when needed: `include: { perfil: true }`

### API Response Patterns

#### Backend Returns
```typescript
// Success
return this.prisma.usuario.findMany({ where, include: { perfil: true } });

// With transform
return {
  access_token,
  usuario: { id, nombre, email },
  permisos: [{ modulo, ver, crear, editar, eliminar }]
};
```

### Security Rules

1. Never expose passwords in API responses
2. Always validate parish access in backend
3. Use JWT for authentication
4. Hash passwords with bcrypt (10 rounds)
5. Validate DTOs with class-validator

### Additional Resources

- Backend agent: `.ai/agent-backend.md`
- Frontend agent: `.ai/agent-frontend.md`
- Architect: `.ai/agent-arquitect.md`

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret
```

### Frontend
Uses Next.js defaults; API calls go to backend on port 3001.
