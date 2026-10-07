# Monkey Backend

API REST construida con NestJS + Prisma + PostgreSQL, organizada con **Clean Architecture** y **Feature-Based** structure.

## Tabla de contenidos

- [Setup](#setup)
- [Scripts](#scripts)
- [Arquitectura](#arquitectura)
- [Estructura de directorios](#estructura-de-directorios)
- [Cómo crear una nueva feature](#cómo-crear-una-nueva-feature)

---

## Setup

```bash
npm install
```

Copia el archivo de entorno y configura las variables:

```bash
cp .env.example .env
```

Variables requeridas:

```env
# Migraciones (rol dueño; solo Prisma CLI y deploy) y runtime (rol monkey_app, sujeto a RLS).
# La app nunca se conecta como el rol dueño. Ver .env.example.
DATABASE_URL="postgresql://postgres:password@localhost:5432/monkey"
SHADOW_DATABASE_URL="postgresql://postgres:password@localhost:5432/monkey_shadow"
APP_DATABASE_URL="postgresql://monkey_app:password@localhost:5432/monkey"
JWT_SECRET="tu-secreto-de-acceso"
JWT_REFRESH_SECRET="tu-secreto-de-refresh"
JWT_EXPIRES_IN=7200
JWT_REFRESH_EXPIRES_IN=2592000
PORT=3000
```

Ejecuta las migraciones y el seed inicial:

```bash
npx prisma migrate deploy
npm run db:seed
```

---

## Scripts

```bash
npm run start:dev     # modo desarrollo con hot reload
npm run start:prod    # modo producción
npm run build         # compilar TypeScript
npm run lint          # lint con auto-fix
npm run test          # unit tests
```

---

## Arquitectura

El proyecto combina dos patrones:

### Clean Architecture

Cada feature está dividida en cuatro capas con responsabilidades estrictas:

| Capa | Carpeta | Responsabilidad |
|------|---------|-----------------|
| **Domain** | `domain/` | Entidades del negocio e interfaces de repositorios. Sin dependencias externas. |
| **Application** | `application/` | Casos de uso y DTOs. Orquesta el dominio sin saber nada de HTTP ni Prisma. |
| **Infrastructure** | `infrastructure/` | Implementaciones concretas: repositorios Prisma, estrategias de autenticación, etc. |
| **Presentation** | `presentation/` | Controladores HTTP. Solo transforma request/response y delega a los casos de uso. |

**Regla de dependencias:** las capas internas nunca importan de las capas externas.

```
Presentation → Application → Domain
Infrastructure → Domain
```

### Feature-Based

Cada dominio de negocio vive en `src/features/<nombre>/` con todas sus capas encapsuladas. Esto hace que agregar, modificar o eliminar una feature sea una operación localizada.

---

## Estructura de directorios

```
src/
├── main.ts
├── app.module.ts
├── swagger.config.ts
│
├── common/                          # Utilidades transversales (sin lógica de negocio)
│   ├── dtos/
│   │   └── response.dto.ts          # Wrapper genérico de respuestas API
│   ├── filters/
│   │   └── http-exception.filter.ts # Manejo global de excepciones con i18n
│   ├── interceptors/
│   │   └── user-context.interceptor.ts
│   └── utils/
│       ├── obfuscate-code.ts
│       └── request-context.ts
│
├── infrastructure/                  # Infraestructura compartida
│   └── database/
│       ├── prisma.module.ts
│       ├── prisma.service.ts
│       └── seeds/
│
└── features/                        # Una carpeta por dominio de negocio
    ├── auth/
    │   ├── auth.module.ts
    │   ├── application/
    │   │   ├── auth.service.ts
    │   │   └── dtos/
    │   ├── infrastructure/
    │   │   └── strategies/
    │   │       └── jwt.strategy.ts
    │   └── presentation/
    │       └── auth.controller.ts
    │
    ├── risk/
    │   ├── risk.module.ts
    │   ├── domain/
    │   │   ├── entities/
    │   │   │   └── risk.entity.ts       # Lógica pura del negocio
    │   │   └── repositories/
    │   │       └── risk.repository.ts   # Interfaz abstracta
    │   ├── application/
    │   │   ├── dtos/
    │   │   └── use-cases/
    │   │       ├── create-risk.use-case.ts
    │   │       ├── get-all-risks.use-case.ts
    │   │       ├── update-risk.use-case.ts
    │   │       └── delete-risk.use-case.ts
    │   ├── infrastructure/
    │   │   └── repositories/
    │   │       └── risk.prisma.repository.ts  # Implementación con Prisma
    │   └── presentation/
    │       └── risk.controller.ts
    │
    └── reason/
        ├── reason.module.ts
        ├── application/
        │   └── reason.service.ts
        └── presentation/
            └── reason.controller.ts
```

---

## Cómo crear una nueva feature

A continuación se documenta el proceso completo para agregar una nueva feature, usando `control` como ejemplo.

### Paso 1: Crear la entidad de dominio

Define la entidad con su lógica de negocio pura. Sin Prisma, sin NestJS, solo TypeScript.

**`src/features/control/domain/entities/control.entity.ts`**

```typescript
export class ControlEntity {
  static generateCode(seq: number): string {
    // lógica de negocio pura
    return `CTR-${seq.toString().padStart(6, '0')}`;
  }
}
```

### Paso 2: Definir la interfaz del repositorio

Declara qué operaciones necesita el dominio, usando tipos propios (sin Prisma).

**`src/features/control/domain/repositories/control.repository.ts`**

```typescript
export type CreateControlInput = {
  name: string;
  description?: string;
  userId: string;
};

export type UpdateControlInput = {
  name?: string;
  description?: string;
  userId: string;
};

export abstract class ControlRepository {
  abstract findAll(): Promise<any[]>;
  abstract create(input: CreateControlInput): Promise<any>;
  abstract update(id: string, input: UpdateControlInput): Promise<any>;
  abstract delete(id: string): Promise<any>;
}
```

### Paso 3: Crear los DTOs

Definen la forma de los datos que entran por HTTP.

**`src/features/control/application/dtos/create-control.dto.ts`**

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateControlDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
```

**`src/features/control/application/dtos/update-control.dto.ts`**

```typescript
import { PartialType } from '@nestjs/swagger';
import { CreateControlDto } from './create-control.dto';

export class UpdateControlDto extends PartialType(CreateControlDto) { }
```

### Paso 4: Crear los casos de uso

Cada operación es una clase con un método `execute()`. Solo conocen el repositorio abstracto.

**`src/features/control/application/use-cases/create-control.use-case.ts`**

```typescript
import { Injectable } from '@nestjs/common';
import { ControlRepository } from '../../domain/repositories/control.repository';
import { CreateControlDto } from '../dtos/create-control.dto';

@Injectable()
export class CreateControlUseCase {
  constructor(private readonly controlRepository: ControlRepository) { }

  execute(dto: CreateControlDto, userId: string) {
    return this.controlRepository.create({
      name: dto.name,
      description: dto.description,
      userId,
    });
  }
}
```

> Repite este patrón para `GetAllControlsUseCase`, `UpdateControlUseCase`, y `DeleteControlUseCase`.

### Paso 5: Implementar el repositorio con Prisma

Aquí vive la infraestructura: Prisma, transacciones, generación de códigos, etc.

**`src/features/control/infrastructure/repositories/control.prisma.repository.ts`**

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { ControlRepository, CreateControlInput, UpdateControlInput } from '../../domain/repositories/control.repository';

@Injectable()
export class ControlPrismaRepository extends ControlRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  findAll() {
    return this.prisma.control.findMany();
  }

  create(input: CreateControlInput) {
    return this.prisma.control.create({
      data: {
        name: input.name,
        description: input.description,
        code: 'PENDING',
        created_by_user: { connect: { id: input.userId } },
      },
    });
  }

  update(id: string, input: UpdateControlInput) {
    return this.prisma.control.update({
      where: { id },
      data: {
        name: input.name,
        description: input.description,
        updated_by_user: { connect: { id: input.userId } },
      },
    });
  }

  delete(id: string) {
    return this.prisma.control.delete({ where: { id } });
  }
}
```

### Paso 6: Crear el controlador

Recibe la request HTTP, extrae los datos necesarios y delega a los casos de uso.

**`src/features/control/presentation/control.controller.ts`**

```typescript
import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiCookieAuth } from '@nestjs/swagger';
import { ResponseDto } from 'src/common/dtos/response.dto';
import { CreateControlDto } from '../application/dtos/create-control.dto';
import { UpdateControlDto } from '../application/dtos/update-control.dto';
import { CreateControlUseCase } from '../application/use-cases/create-control.use-case';
import { GetAllControlsUseCase } from '../application/use-cases/get-all-controls.use-case';
import { UpdateControlUseCase } from '../application/use-cases/update-control.use-case';
import { DeleteControlUseCase } from '../application/use-cases/delete-control.use-case';

@ApiCookieAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('controls')
export class ControlController {
  constructor(
    private readonly createControlUseCase: CreateControlUseCase,
    private readonly getAllControlsUseCase: GetAllControlsUseCase,
    private readonly updateControlUseCase: UpdateControlUseCase,
    private readonly deleteControlUseCase: DeleteControlUseCase,
  ) { }

  @Post()
  async create(@Req() req: any, @Body() body: CreateControlDto) {
    await this.createControlUseCase.execute(body, req.user.id);
    return new ResponseDto({ statusCode: HttpStatus.CREATED, message: 'Control creado' });
  }

  @Get()
  async findAll() {
    const data = await this.getAllControlsUseCase.execute();
    return new ResponseDto({ statusCode: HttpStatus.OK, message: 'Controles obtenidos', data });
  }

  @Patch(':id')
  async update(@Req() req: any, @Param('id') id: string, @Body() body: UpdateControlDto) {
    await this.updateControlUseCase.execute(id, body, req.user.id);
    return new ResponseDto({ statusCode: HttpStatus.OK, message: 'Control actualizado' });
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.deleteControlUseCase.execute(id);
    return new ResponseDto({ statusCode: HttpStatus.OK, message: 'Control eliminado' });
  }
}
```

### Paso 7: Crear el módulo

El módulo vincula el repositorio abstracto con su implementación concreta (inversión de dependencia).

**`src/features/control/control.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { ControlController } from './presentation/control.controller';
import { ControlRepository } from './domain/repositories/control.repository';
import { ControlPrismaRepository } from './infrastructure/repositories/control.prisma.repository';
import { CreateControlUseCase } from './application/use-cases/create-control.use-case';
import { GetAllControlsUseCase } from './application/use-cases/get-all-controls.use-case';
import { UpdateControlUseCase } from './application/use-cases/update-control.use-case';
import { DeleteControlUseCase } from './application/use-cases/delete-control.use-case';

@Module({
  controllers: [ControlController],
  providers: [
    {
      provide: ControlRepository,    // token abstracto
      useClass: ControlPrismaRepository, // implementación concreta
    },
    CreateControlUseCase,
    GetAllControlsUseCase,
    UpdateControlUseCase,
    DeleteControlUseCase,
  ],
})
export class ControlModule { }
```

### Paso 8: Registrar en AppModule

**`src/app.module.ts`**

```typescript
import { ControlModule } from './features/control/control.module';

@Module({
  imports: [
    // ... otros módulos
    ControlModule,
  ],
})
export class AppModule { }
```

---

### Resumen del checklist para una nueva feature

```
src/features/<feature>/
├── <feature>.module.ts                              ✅ Registra y vincula
├── domain/
│   ├── entities/<feature>.entity.ts                ✅ Lógica de negocio pura
│   └── repositories/<feature>.repository.ts        ✅ Interfaz abstracta
├── application/
│   ├── dtos/
│   │   ├── create-<feature>.dto.ts                 ✅ DTO de creación
│   │   └── update-<feature>.dto.ts                 ✅ DTO de actualización (PartialType)
│   └── use-cases/
│       ├── create-<feature>.use-case.ts            ✅ Caso de uso
│       ├── get-all-<feature>s.use-case.ts          ✅ Caso de uso
│       ├── update-<feature>.use-case.ts            ✅ Caso de uso
│       └── delete-<feature>.use-case.ts            ✅ Caso de uso
├── infrastructure/
│   └── repositories/
│       └── <feature>.prisma.repository.ts          ✅ Implementación Prisma
└── presentation/
    └── <feature>.controller.ts                     ✅ Controlador HTTP
```

Luego agrega el módulo en `src/app.module.ts` y está listo.

## Pruebas y CI

| Qué | Comando | Necesita |
|---|---|---|
| Unitarias | `npm test` | nada |
| Lint (sin `--fix`, como en CI) | `npm run lint:ci` | nada |
| Aislamiento entre empresas: base de datos (RLS) y API (HTTP) | `npm run test:e2e` | `TEST_DATABASE_URL`: un Postgres **desechable** con migraciones, catálogo y `monkey_app` con contraseña (`TEST_APP_PASSWORD`, por defecto `test`) |
| Catálogo, clonado y audit trail | `npm run catalog:verify` · `clone:verify` · `audit:verify` | base con las migraciones y el catálogo cargados |

Las pruebas de RLS escriben dentro de una transacción que se revierte. **Las de HTTP no**: crean empresas, servicios y activos reales
por la API (con nombres únicos por corrida), así que solo sirven sobre una base desechable. Ambas se niegan a correr contra un
servidor que no sea local: nunca las apuntes a la base compartida de dev. Para correrlas en tu máquina:

```bash
docker run -d --name monkey-test-pg -e POSTGRES_PASSWORD=test -e POSTGRES_DB=monkey -p 55432:5432 postgres:17
export DATABASE_URL=postgresql://postgres:test@localhost:55432/monkey
export APP_DATABASE_URL=postgresql://monkey_app:test@localhost:55432/monkey
export TEST_DATABASE_URL=$DATABASE_URL
npx prisma migrate deploy
docker exec monkey-test-pg psql -U postgres -d monkey -c "ALTER ROLE monkey_app PASSWORD 'test'"
npm run catalog:load -- --apply && npm run reference:load -- --apply
npm run test:e2e
```

Exporta las tres URLs en la misma terminal: el `.env` del proyecto apunta a la base de dev y `dotenv` no pisa las variables ya definidas.
`.github/workflows/ci.yml` hace exactamente esto en cada PR a `develop`/`main`.
