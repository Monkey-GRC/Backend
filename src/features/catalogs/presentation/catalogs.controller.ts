import { Controller, Get, HttpStatus, Param } from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { I18nContext } from 'nestjs-i18n';
import { SERVICE_COUNTRY_REGIONS } from '../../../common/catalogs/service-catalogs';
import type { Principal } from '../../../common/auth/principal';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { ResponseDto } from '../../../common/dtos/response.dto';
import { GetCatalogUseCase } from '../application/use-cases/get-catalog.use-case';
import { GetContractedFrameworksUseCase } from '../application/use-cases/get-contracted-frameworks.use-case';
import { Catalog } from '../domain/entities/catalog-item';

const t = (key: string): string =>
  (I18nContext.current()?.t(key) as string | undefined) ?? key;

// `eu` no es un país sino una región y `other` es "Otro": la pantalla los agrupa aparte.
const countryGroup = (value: string): 'country' | 'region' | 'other' =>
  value === 'eu' ? 'region' : value === 'other' ? 'other' : 'country';

// En los países del servicio, además de `eu`, `latam` y `global` son agrupaciones.
const serviceCountryGroup = (value: string): 'country' | 'region' =>
  SERVICE_COUNTRY_REGIONS.includes(value) ? 'region' : 'country';

function toItems(catalog: Catalog) {
  if (catalog.kind === 'capabilities') {
    return catalog.items.map((c) => ({
      catalog_code: c.catalogCode,
      category: c.category,
      method: c.method,
      required_permissions: c.requiredPermissions,
      base_frequency: c.baseFrequency,
      // Lo que el cliente elige al conectar (D67). `name` es la marca y no se traduce; `logo_key` es el nombre del SVG en la plataforma.
      platforms: c.platforms.map((p) => ({
        code: p.code,
        name: p.name,
        logo_key: p.logoKey,
        availability: p.availability,
        connection_methods: p.connectionMethods,
      })),
      generated_evidence: c.generatedEvidence,
    }));
  }
  if (catalog.kind === 'regions') {
    // La etiqueta sale de i18n cuando existe; si no, el nombre del proveedor.
    return catalog.items.map((r) => {
      const label = t(`catalogs.aws_region.${r.code}`);
      return { value: r.code, label: label === `catalogs.aws_region.${r.code}` ? r.name : label };
    });
  }
  if (catalog.kind === 'regulations') {
    return catalog.items.map((r) => ({
      code: r.code,
      name: r.name,
      jurisdiction: r.jurisdiction,
      // "Ninguna" y "Otra" no son leyes: su etiqueta sale de i18n, el resto usa su nombre propio.
      label: r.code === 'none' || r.code === 'other' ? t(`catalogs.regulation.${r.code}`) : r.name,
    }));
  }
  if (catalog.kind === 'frameworks') {
    return catalog.items.map((f) => ({
      code: f.code,
      name: f.name,
      description: f.description,
      availability: f.availability,
      label: f.name,
    }));
  }
  const isCountry = catalog.name === 'incorporation_country' || catalog.name === 'client_country';
  const isServiceCountry = catalog.name === 'service_country';
  return catalog.values.map((value) => ({
    value,
    label: t(`catalogs.${isCountry ? 'country' : catalog.name}.${value}`),
    ...(isCountry ? { group: countryGroup(value) } : {}),
    ...(isServiceCountry ? { group: serviceCountryGroup(value) } : {}),
  }));
}

// Las opciones las puede leer cualquier usuario con sesión; no llevan datos de ninguna empresa.
@ApiTags('catalogs')
@ApiCookieAuth()
@Controller('catalogs')
export class CatalogsController {
  constructor(
    private readonly getCatalog: GetCatalogUseCase,
    private readonly getContracted: GetContractedFrameworksUseCase,
  ) {}

  // Va antes de `:name` para que no se confunda con un catálogo. Solo el cliente: es lo suyo.
  @Get('contracted-frameworks')
  @Roles('admin_empresa')
  async contracted(@CurrentUser() principal: Principal) {
    const items = await this.getContracted.execute(principal);
    return new ResponseDto(HttpStatus.OK, t('framework.contracted'), {
      items: toItems({ kind: 'frameworks', items }),
    });
  }

  @Get(':name')
  async get(@Param('name') name: string) {
    const catalog = await this.getCatalog.execute(name);
    return new ResponseDto(HttpStatus.OK, t('catalog.list'), { items: toItems(catalog) });
  }
}
