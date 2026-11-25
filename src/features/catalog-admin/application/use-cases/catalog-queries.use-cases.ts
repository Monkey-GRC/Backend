import { Injectable } from '@nestjs/common';
import { DomainError } from '../../../../common/errors/domain-error';
import { Page } from '../../../../common/pagination/page';
import {
  AllControlsFilter,
  CatalogAdminRepository,
  CatalogFilter,
  CauseDetail,
  CauseSummary,
  ControlDetail,
  ControlFilter,
  ControlSummary,
  EvidenceTemplateSummary,
  FrameworkDetail,
  FrameworkSummary,
  PageQuery,
  RiskDetail,
  RiskSummary,
  TestDetail,
  TestSummary,
} from '../../domain/repositories/catalog-admin.repository';

// Lectura del catálogo maestro (contracts/modules/monkey-admin-catalog.md). Solo `admin_monkey`, lo impone @Can en el controlador. El catálogo es global:
// no hay empresa que acotar. Un elemento que no existe es `404`.
const found = <T>(value: T | null): T => {
  if (!value) throw new DomainError('NOT_FOUND');
  return value;
};

@Injectable()
export class ListFrameworksUseCase {
  constructor(private readonly catalog: CatalogAdminRepository) {}
  execute(query: PageQuery): Promise<Page<FrameworkSummary>> {
    return this.catalog.listFrameworks(query);
  }
}

@Injectable()
export class GetFrameworkUseCase {
  constructor(private readonly catalog: CatalogAdminRepository) {}
  async execute(id: string): Promise<FrameworkDetail> {
    return found(await this.catalog.findFramework(id));
  }
}

@Injectable()
export class ListFrameworkControlsUseCase {
  constructor(private readonly catalog: CatalogAdminRepository) {}
  async execute(frameworkId: string, filter: ControlFilter): Promise<Page<ControlSummary>> {
    return found(await this.catalog.listFrameworkControls(frameworkId, filter));
  }
}

@Injectable()
export class ListCatalogControlsUseCase {
  constructor(private readonly catalog: CatalogAdminRepository) {}
  execute(filter: AllControlsFilter): Promise<Page<ControlSummary>> {
    return this.catalog.listControls(filter);
  }
}

@Injectable()
export class GetCatalogControlUseCase {
  constructor(private readonly catalog: CatalogAdminRepository) {}
  async execute(id: string): Promise<ControlDetail> {
    return found(await this.catalog.findControl(id));
  }
}

@Injectable()
export class ListCatalogRisksUseCase {
  constructor(private readonly catalog: CatalogAdminRepository) {}
  execute(filter: CatalogFilter): Promise<Page<RiskSummary>> {
    return this.catalog.listRisks(filter);
  }
}

@Injectable()
export class GetCatalogRiskUseCase {
  constructor(private readonly catalog: CatalogAdminRepository) {}
  async execute(id: string): Promise<RiskDetail> {
    return found(await this.catalog.findRisk(id));
  }
}

@Injectable()
export class ListCatalogCausesUseCase {
  constructor(private readonly catalog: CatalogAdminRepository) {}
  execute(filter: CatalogFilter): Promise<Page<CauseSummary>> {
    return this.catalog.listCauses(filter);
  }
}

@Injectable()
export class GetCatalogCauseUseCase {
  constructor(private readonly catalog: CatalogAdminRepository) {}
  async execute(id: string): Promise<CauseDetail> {
    return found(await this.catalog.findCause(id));
  }
}

@Injectable()
export class ListCatalogTestsUseCase {
  constructor(private readonly catalog: CatalogAdminRepository) {}
  execute(filter: CatalogFilter & { dimension?: string }): Promise<Page<TestSummary>> {
    return this.catalog.listTests(filter);
  }
}

@Injectable()
export class GetCatalogTestUseCase {
  constructor(private readonly catalog: CatalogAdminRepository) {}
  async execute(id: string): Promise<TestDetail> {
    return found(await this.catalog.findTest(id));
  }
}

@Injectable()
export class ListCatalogEvidenceTemplatesUseCase {
  constructor(private readonly catalog: CatalogAdminRepository) {}
  execute(filter: CatalogFilter): Promise<Page<EvidenceTemplateSummary>> {
    return this.catalog.listEvidenceTemplates(filter);
  }
}

@Injectable()
export class GetCatalogEvidenceTemplateUseCase {
  constructor(private readonly catalog: CatalogAdminRepository) {}
  async execute(id: string): Promise<EvidenceTemplateSummary> {
    return found(await this.catalog.findEvidenceTemplate(id));
  }
}
