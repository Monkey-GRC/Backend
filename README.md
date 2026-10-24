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

**Versión de Node:** usa Node 20 (`.nvmrc`; `nvm use`). Es la que usan el CI y el `Dockerfile`, y **el `package-lock.json` debe generarse con ella**:
npm 11 (Node 24) descarta del lock paquetes que npm 10 sí instala (por ejemplo los *peers* de React de Prisma Studio) y entonces `npm ci` falla en el CI.
Si cambias dependencias con otra versión: `docker run --rm -v "$PWD":/w -w /w node:20-alpine npm install --package-lock-only`.

Copia el archivo de entorno y configura las variables:

```bash
cp .env.example .env
```

Variables requeridas (la lista completa, con su explicación, está en `.env.example`; solo se documenta aquí lo que la app lee de verdad):

```env
# Migraciones (rol dueño; solo Prisma CLI y deploy) y runtime (rol monkey_app, sujeto a RLS).
# La app nunca se conecta como el rol dueño.
DATABASE_URL="postgresql://postgres:password@localhost:5432/monkey"
SHADOW_DATABASE_URL="postgresql://postgres:password@localhost:5432/monkey_shadow"
APP_DATABASE_URL="postgresql://monkey_app:password@localhost:5432/monkey"
JWT_SECRET="…"            # firma del access token
JWT_ACCESS_EXPIRES_IN=900 # y SESSION_IDLE_TIMEOUT, SESSION_MAX_DURATION
TOKEN_HASH_PEPPER="…"
CREDENTIALS_ENCRYPTION_KEY="…"
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

## Documentación de la API (solo local)

La API se documenta con OpenAPI (Swagger) y **solo existe en tu máquina**: no se publica en el dominio de la API.

- **Encender:** pon `API_DOCS_ENABLED=true` en tu `.env` (viene así en `.env.example`) y arranca con `npm run start:dev`. Abre <http://localhost:3000/v1/docs>; el JSON está en `/v1/docs-json`.
- **Apagada por defecto:** sin la variable, `/v1/docs` y `/v1/docs-json` responden 404 como cualquier ruta que no existe. Con `NODE_ENV=production` tampoco se sirven, aunque la variable esté puesta. Nunca la agregues al `.env` del servidor.
- **Probar desde la página:** inicia sesión en *Autenticación → login*; el navegador guarda las cookies y las demás pruebas ya van con sesión.
- **Qué muestra:** cada endpoint con resumen, descripción, roles que pueden llamarlo (salen de `@Roles`/`@Public`, así que no se desfasan), el sobre de respuesta con su `data` tipada, y los errores de negocio posibles. La descripción general trae las convenciones y el catálogo de errores.

### Cómo documentar un endpoint nuevo

1. **Grupo:** `@ApiTags(API_TAGS.<grupo>)` en el controlador (o en el método, si el controlador mezcla grupos). Un grupo nuevo se declara con título y descripción en `src/common/swagger/api-docs.config.ts`.
2. **Operación:** `@ApiOperation({ summary, description })` en español, qué hace y cualquier regla que el frontend deba saber.
3. **Respuesta:** `@ApiData(Modelo, 'descripción')`, `@ApiPaged(Modelo, …)`, `@ApiItems(Modelo, …)`, `@ApiEmpty(…)` o `@ApiNoBody(…)` (`src/common/swagger/api-envelope.ts`). `Modelo` es una clase solo de documentación junto al mapper (`*.responses.ts`) con `@ApiProperty({ description })` en cada campo.
4. **Errores de negocio:** `@ApiDomainErrors('CODIGO', …)` con los `DomainError` que la operación puede lanzar. Los comunes (401, 403, 404 por id, 422) se agregan solos.
5. **DTO de entrada:** `@ApiProperty({ description, example, enum, enumName })` en cada campo; los enums llevan `enumName` para que se muestren una sola vez.

`npm test` falla si una operación queda sin resumen, sin respuesta de éxito, sin grupo con título, o si un campo o parámetro queda sin descripción (`src/common/swagger/api-docs.spec.ts`).

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
| &nbsp;&nbsp;↳ `test/aislamiento/` | RLS en la base de datos y aislamiento por HTTP entre empresas | (lo mismo) |
| &nbsp;&nbsp;↳ `test/auditoria/` | **Auditoría atómica** (SEG-36): cada acción deja su rastro y, si el rastro falla, la acción se revierte. **Evaluaciones inmutables** (SEG-38): ni la app ni el dueño de la tabla pueden modificar lo medido, borrar ni vaciar | (lo mismo) |
| &nbsp;&nbsp;↳ `test/autenticacion/` | Política de contraseña, bloqueo, sesión (30 min / 8 h), cookies, tokens hasheados, secretos del cliente y freno de la clave de acceso | (lo mismo) |
| Catálogo, clonado, audit trail y evaluaciones | `npm run catalog:verify` · `clone:verify` · `audit:verify` | base con las migraciones y el catálogo cargados |

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
