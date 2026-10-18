import { Controller, Get, HttpStatus, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { I18nContext } from 'nestjs-i18n';
import { Roles } from '../../../common/decorators/roles.decorator';
import { ResponseDto } from '../../../common/dtos/response.dto';
import { toPageResponse } from '../../../common/pagination/page';
import { AllControlsListQuery, CatalogListQuery, CatalogPageQuery, ControlsListQuery, TestsListQuery } from '../application/dtos/catalog-list.query';
import {
  GetCatalogCauseUseCase,
  GetCatalogControlUseCase,
  GetCatalogEvidenceTemplateUseCase,
  GetCatalogRiskUseCase,
  GetCatalogTestUseCase,
  GetFrameworkUseCase,
  ListCatalogCausesUseCase,
  ListCatalogControlsUseCase,
  ListCatalogEvidenceTemplatesUseCase,
  ListCatalogRisksUseCase,
  ListCatalogTestsUseCase,
  ListFrameworkControlsUseCase,
  ListFrameworksUseCase,
} from '../application/use-cases/catalog-queries.use-cases';
import {
  toCause,
  toCauseDetail,
  toControl,
  toControlDetail,
  toEvidenceTemplate,
  toFramework,
  toFrameworkDetail,
  toRisk,
  toRiskDetail,
  toTest,
  toTestDetail,
} from './catalog-admin-response.mapper';
import { API_TAGS } from '../../../common/swagger/api-docs.config';
import { ApiData, ApiPaged } from '../../../common/swagger/api-envelope';
import { CatalogCauseDetailResponse, CatalogCauseResponse, CatalogControlDetailResponse, CatalogControlResponse, CatalogEvidenceTemplateResponse, CatalogRiskDetailResponse, CatalogRiskResponse, CatalogTestDetailResponse, CatalogTestResponse, FrameworkDetailResponse, FrameworkResponse } from './catalog-admin.responses';

const t = (key: string): string => (I18nContext.current()?.t(key) as string | undefined) ?? key;
const uuid = new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND });

// contracts/modules/monkey-admin-catalog.md — lectura del catálogo maestro, exclusiva de admin_monkey. La ruta es `catalog` (singular, el catálogo
// maestro); no confundir con `catalogs`, las listas desplegables del onboarding.
@Roles('admin_monkey')
@Controller('catalog')
export class CatalogAdminController {
  constructor(
    private readonly listFrameworks: ListFrameworksUseCase,
    private readonly getFramework: GetFrameworkUseCase,
    private readonly listFrameworkControls: ListFrameworkControlsUseCase,
    private readonly listAllControls: ListCatalogControlsUseCase,
    private readonly getControl: GetCatalogControlUseCase,
    private readonly listRisks: ListCatalogRisksUseCase,
    private readonly getRisk: GetCatalogRiskUseCase,
    private readonly listCauses: ListCatalogCausesUseCase,
    private readonly getCause: GetCatalogCauseUseCase,
    private readonly listTests: ListCatalogTestsUseCase,
    private readonly getTest: GetCatalogTestUseCase,
    private readonly listEvidenceTemplates: ListCatalogEvidenceTemplatesUseCase,
    private readonly getEvidenceTemplate: GetCatalogEvidenceTemplateUseCase,
  ) {}

  @ApiTags(API_TAGS.catalogFrameworks)
  @ApiOperation({ summary: 'Listar marcos del catálogo', description: 'Los marcos del catálogo maestro (SOC 2…) con su disponibilidad y cuántos requisitos, controles y pruebas tienen.' })
  @ApiPaged(FrameworkResponse, 'Página de marcos.')
  @Get('frameworks')
  async frameworks(@Query() q: CatalogPageQuery) {
    const page = await this.listFrameworks.execute({ page: q.page, pageSize: q.page_size });
    return new ResponseDto(HttpStatus.OK, t('catalog_admin.framework_list'), toPageResponse(page, toFramework));
  }

  @ApiTags(API_TAGS.catalogFrameworks)
  @ApiOperation({ summary: 'Detalle de un marco', description: 'El marco con sus criterios de confianza y la lista de requisitos (código, categoría, puntos de enfoque y controles de cada uno).' })
  @ApiData(FrameworkDetailResponse, 'Detalle del marco.')
  @Get('frameworks/:id')
  async framework(@Param('id', uuid) id: string) {
    return new ResponseDto(HttpStatus.OK, t('catalog_admin.framework_read'), toFrameworkDetail(await this.getFramework.execute(id)));
  }

  @ApiTags(API_TAGS.catalogFrameworks)
  @ApiOperation({ summary: 'Controles de un marco', description: 'Los controles que cuelgan de los requisitos del marco, con filtros por búsqueda, estado, origen, dominio, requisito y si tienen evidencia requerida.' })
  @ApiPaged(CatalogControlResponse, 'Página de controles del marco.')
  @Get('frameworks/:id/controls')
  async controls(@Param('id', uuid) id: string, @Query() q: ControlsListQuery) {
    const page = await this.listFrameworkControls.execute(id, {
      page: q.page,
      pageSize: q.page_size,
      search: q.search,
      isActive: q.is_active,
      origin: q.origin,
      domain: q.domain,
      requirementCode: q.requirement_code,
      hasEvidenceTemplate: q.has_evidence_template,
    });
    return new ResponseDto(HttpStatus.OK, t('catalog_admin.control_list'), toPageResponse(page, toControl));
  }

  @ApiTags(API_TAGS.catalogControls)
  @ApiOperation({ summary: 'Listar controles del catálogo', description: 'Todos los controles del catálogo maestro. Con `framework_id` solo los de ese marco; con `unlinked=true`, los que no cuelgan de ningún requisito (por ejemplo, uno recién creado que aún no se vincula).' })
  @ApiPaged(CatalogControlResponse, 'Página de controles.')
  @Get('controls')
  async allControls(@Query() q: AllControlsListQuery) {
    const page = await this.listAllControls.execute({
      page: q.page,
      pageSize: q.page_size,
      search: q.search,
      isActive: q.is_active,
      origin: q.origin,
      domain: q.domain,
      requirementCode: q.requirement_code,
      hasEvidenceTemplate: q.has_evidence_template,
      frameworkId: q.framework_id,
      unlinked: q.unlinked,
    });
    return new ResponseDto(HttpStatus.OK, t('catalog_admin.control_list'), toPageResponse(page, toControl));
  }

  @ApiTags(API_TAGS.catalogControls)
  @ApiOperation({ summary: 'Detalle de un control', description: 'El control con sus puntos de enfoque, dimensiones, pruebas, plantillas de evidencia, políticas y causas.' })
  @ApiData(CatalogControlDetailResponse, 'Detalle del control.')
  @Get('controls/:id')
  async control(@Param('id', uuid) id: string) {
    return new ResponseDto(HttpStatus.OK, t('catalog_admin.control_read'), toControlDetail(await this.getControl.execute(id)));
  }

  @ApiTags(API_TAGS.catalogRisks)
  @ApiOperation({ summary: 'Listar riesgos del catálogo', description: 'Los riesgos del catálogo maestro, con búsqueda por código o nombre y filtros por estado y origen.' })
  @ApiPaged(CatalogRiskResponse, 'Página de riesgos.')
  @Get('risks')
  async risks(@Query() q: CatalogListQuery) {
    const page = await this.listRisks.execute(this.filter(q));
    return new ResponseDto(HttpStatus.OK, t('catalog_admin.risk_list'), toPageResponse(page, toRisk));
  }

  @ApiTags(API_TAGS.catalogRisks)
  @ApiOperation({ summary: 'Detalle de un riesgo', description: 'El riesgo con su descripción, impactos potenciales y causas vinculadas.' })
  @ApiData(CatalogRiskDetailResponse, 'Detalle del riesgo.')
  @Get('risks/:id')
  async risk(@Param('id', uuid) id: string) {
    return new ResponseDto(HttpStatus.OK, t('catalog_admin.risk_read'), toRiskDetail(await this.getRisk.execute(id)));
  }

  @ApiTags(API_TAGS.catalogRisks)
  @ApiOperation({ summary: 'Listar causas del catálogo', description: 'Las causas del catálogo maestro, con búsqueda por código o nombre y filtros por estado y origen.' })
  @ApiPaged(CatalogCauseResponse, 'Página de causas.')
  @Get('causes')
  async causes(@Query() q: CatalogListQuery) {
    const page = await this.listCauses.execute(this.filter(q));
    return new ResponseDto(HttpStatus.OK, t('catalog_admin.cause_list'), toPageResponse(page, toCause));
  }

  @ApiTags(API_TAGS.catalogRisks)
  @ApiOperation({ summary: 'Detalle de una causa', description: 'La causa con los riesgos a los que contribuye y los controles que la tratan.' })
  @ApiData(CatalogCauseDetailResponse, 'Detalle de la causa.')
  @Get('causes/:id')
  async cause(@Param('id', uuid) id: string) {
    return new ResponseDto(HttpStatus.OK, t('catalog_admin.cause_read'), toCauseDetail(await this.getCause.execute(id)));
  }

  @ApiTags(API_TAGS.catalogTests)
  @ApiOperation({ summary: 'Listar pruebas del catálogo', description: 'Las pruebas del catálogo maestro, con búsqueda y filtros por estado, origen y dimensión.' })
  @ApiPaged(CatalogTestResponse, 'Página de pruebas.')
  @Get('tests')
  async tests(@Query() q: TestsListQuery) {
    const page = await this.listTests.execute({ ...this.filter(q), dimension: q.dimension });
    return new ResponseDto(HttpStatus.OK, t('catalog_admin.test_list'), toPageResponse(page, toTest));
  }

  @ApiTags(API_TAGS.catalogTests)
  @ApiOperation({ summary: 'Detalle de una prueba', description: 'La prueba con los textos del comité (objetivo, pasos, atributos a validar, criterio de cumplimiento…), que **solo ve `admin_monkey`** y nunca salen al cliente (D70), y los controles que la usan.' })
  @ApiData(CatalogTestDetailResponse, 'Detalle de la prueba.')
  @Get('tests/:id')
  async test(@Param('id', uuid) id: string) {
    return new ResponseDto(HttpStatus.OK, t('catalog_admin.test_read'), toTestDetail(await this.getTest.execute(id)));
  }

  @ApiTags(API_TAGS.catalogEvidence)
  @ApiOperation({ summary: 'Listar plantillas de evidencia', description: 'Las plantillas de evidencia del catálogo maestro, con búsqueda y filtros por estado y origen.' })
  @ApiPaged(CatalogEvidenceTemplateResponse, 'Página de plantillas.')
  @Get('evidence-templates')
  async evidenceTemplates(@Query() q: CatalogListQuery) {
    const page = await this.listEvidenceTemplates.execute(this.filter(q));
    return new ResponseDto(HttpStatus.OK, t('catalog_admin.evidence_template_list'), toPageResponse(page, toEvidenceTemplate));
  }

  @ApiTags(API_TAGS.catalogEvidence)
  @ApiOperation({ summary: 'Detalle de una plantilla de evidencia', description: 'La plantilla con la cantidad de controles que la piden.' })
  @ApiData(CatalogEvidenceTemplateResponse, 'Detalle de la plantilla.')
  @Get('evidence-templates/:id')
  async evidenceTemplate(@Param('id', uuid) id: string) {
    return new ResponseDto(HttpStatus.OK, t('catalog_admin.evidence_template_read'), toEvidenceTemplate(await this.getEvidenceTemplate.execute(id)));
  }

  private filter(q: CatalogListQuery) {
    return { page: q.page, pageSize: q.page_size, search: q.search, isActive: q.is_active, origin: q.origin };
  }
}
