import { Controller, Get, HttpStatus, Param } from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { I18nContext } from 'nestjs-i18n';
import { ResponseDto } from '../../../common/dtos/response.dto';
import { GetCatalogUseCase } from '../application/use-cases/get-catalog.use-case';
import { Catalog } from '../domain/entities/catalog-item';

const t = (key: string): string =>
  (I18nContext.current()?.t(key) as string | undefined) ?? key;

// `eu` no es un país sino una región y `other` es "Otro": la pantalla los agrupa aparte.
const countryGroup = (value: string): 'country' | 'region' | 'other' =>
  value === 'eu' ? 'region' : value === 'other' ? 'other' : 'country';

function toItems(catalog: Catalog) {
  if (catalog.kind === 'regulations') {
    return catalog.items.map((r) => ({
      code: r.code,
      name: r.name,
      jurisdiction: r.jurisdiction,
      // "Ninguna" y "Otra" no son leyes: su etiqueta sale de i18n, el resto usa su nombre propio.
      label: r.code === 'none' || r.code === 'other' ? t(`catalogs.regulation.${r.code}`) : r.name,
    }));
  }
  const isCountry = catalog.name === 'incorporation_country' || catalog.name === 'client_country';
  return catalog.values.map((value) => ({
    value,
    label: t(`catalogs.${isCountry ? 'country' : catalog.name}.${value}`),
    ...(isCountry ? { group: countryGroup(value) } : {}),
  }));
}

// Las opciones las puede leer cualquier usuario con sesión; no llevan datos de ninguna empresa.
@ApiTags('catalogs')
@ApiCookieAuth()
@Controller('catalogs')
export class CatalogsController {
  constructor(private readonly getCatalog: GetCatalogUseCase) {}

  @Get(':name')
  async get(@Param('name') name: string) {
    const catalog = await this.getCatalog.execute(name);
    return new ResponseDto(HttpStatus.OK, t('catalog.list'), { items: toItems(catalog) });
  }
}
