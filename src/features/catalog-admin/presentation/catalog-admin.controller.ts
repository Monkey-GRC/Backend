import { Controller, Get, HttpStatus, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
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

const t = (key: string): string => (I18nContext.current()?.t(key) as string | undefined) ?? key;
const uuid = new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND });

// contracts/modules/monkey-admin-catalog.md — lectura del catálogo maestro, exclusiva de admin_monkey. La ruta es `catalog` (singular, el catálogo
// maestro); no confundir con `catalogs`, las listas desplegables del onboarding.
@ApiTags('catalog')
@ApiCookieAuth()
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

  @Get('frameworks')
  async frameworks(@Query() q: CatalogPageQuery) {
    const page = await this.listFrameworks.execute({ page: q.page, pageSize: q.page_size });
    return new ResponseDto(HttpStatus.OK, t('catalog_admin.framework_list'), toPageResponse(page, toFramework));
  }

  @Get('frameworks/:id')
  async framework(@Param('id', uuid) id: string) {
    return new ResponseDto(HttpStatus.OK, t('catalog_admin.framework_read'), toFrameworkDetail(await this.getFramework.execute(id)));
  }

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

  @Get('controls/:id')
  async control(@Param('id', uuid) id: string) {
    return new ResponseDto(HttpStatus.OK, t('catalog_admin.control_read'), toControlDetail(await this.getControl.execute(id)));
  }

  @Get('risks')
  async risks(@Query() q: CatalogListQuery) {
    const page = await this.listRisks.execute(this.filter(q));
    return new ResponseDto(HttpStatus.OK, t('catalog_admin.risk_list'), toPageResponse(page, toRisk));
  }

  @Get('risks/:id')
  async risk(@Param('id', uuid) id: string) {
    return new ResponseDto(HttpStatus.OK, t('catalog_admin.risk_read'), toRiskDetail(await this.getRisk.execute(id)));
  }

  @Get('causes')
  async causes(@Query() q: CatalogListQuery) {
    const page = await this.listCauses.execute(this.filter(q));
    return new ResponseDto(HttpStatus.OK, t('catalog_admin.cause_list'), toPageResponse(page, toCause));
  }

  @Get('causes/:id')
  async cause(@Param('id', uuid) id: string) {
    return new ResponseDto(HttpStatus.OK, t('catalog_admin.cause_read'), toCauseDetail(await this.getCause.execute(id)));
  }

  @Get('tests')
  async tests(@Query() q: TestsListQuery) {
    const page = await this.listTests.execute({ ...this.filter(q), dimension: q.dimension });
    return new ResponseDto(HttpStatus.OK, t('catalog_admin.test_list'), toPageResponse(page, toTest));
  }

  @Get('tests/:id')
  async test(@Param('id', uuid) id: string) {
    return new ResponseDto(HttpStatus.OK, t('catalog_admin.test_read'), toTestDetail(await this.getTest.execute(id)));
  }

  @Get('evidence-templates')
  async evidenceTemplates(@Query() q: CatalogListQuery) {
    const page = await this.listEvidenceTemplates.execute(this.filter(q));
    return new ResponseDto(HttpStatus.OK, t('catalog_admin.evidence_template_list'), toPageResponse(page, toEvidenceTemplate));
  }

  @Get('evidence-templates/:id')
  async evidenceTemplate(@Param('id', uuid) id: string) {
    return new ResponseDto(HttpStatus.OK, t('catalog_admin.evidence_template_read'), toEvidenceTemplate(await this.getEvidenceTemplate.execute(id)));
  }

  private filter(q: CatalogListQuery) {
    return { page: q.page, pageSize: q.page_size, search: q.search, isActive: q.is_active, origin: q.origin };
  }
}
