import { Injectable } from '@nestjs/common';
import { AssetRepository } from 'src/features/asset/domain/repositories/asset.repository';
import { TemplateRepository } from 'src/features/template/domain/repositories/template.repository';
import { CentralPrismaService } from 'src/infrastructure/database/central-prisma.service';
import { RequestContext } from 'src/common/utils/request-context';
import { GetDashboardControlsUseCase } from './get-dashboard-controls.use-case';
import { ControlCompliance } from '../compliance.calculator';

export type ContractedTemplateSummary = { id: string; name: string; compliance: number | null };

export type DashboardSummary = {
  /** % de cumplimiento calculado solo sobre los controles ya evaluados (ver controlsEvaluated), del template pedido. */
  frameworkCompliance: number | null;
  controlsCompliant: number;
  /** Controles con al menos un check evaluado (no todo PENDING/sin checks) — cobertura de la evaluación. */
  controlsEvaluated: number;
  /** Todos los controles del framework: AUTOMATIC + MANUAL + HYBRID. */
  controlsTotal: number;
  openFindings: number;
  /** Servidores registrados y activos (origen Wazuh) considerados en este resumen. */
  serversEvaluated: number;
  /** Nombre de la empresa (tenant) — para el resumen del Dashboard. */
  companyName: string;
  /** Total de Asset registrados (sin filtrar por estado) — distinto de serversEvaluated. */
  assetsCount: number;
  /** Frameworks adoptados por este tenant, cada uno con su propio % de cumplimiento. */
  contractedTemplates: ContractedTemplateSummary[];
};

function averageCompliance(controls: ControlCompliance[]): number | null {
  const withResults = controls.filter((control) => control.compliance !== null);
  if (withResults.length === 0) return null;
  return (
    Math.round(
      (withResults.reduce((sum, control) => sum + (control.compliance ?? 0), 0) / withResults.length) * 100,
    ) / 100
  );
}

@Injectable()
export class GetDashboardSummaryUseCase {
  constructor(
    private readonly getDashboardControlsUseCase: GetDashboardControlsUseCase,
    private readonly assetRepository: AssetRepository,
    private readonly templateRepository: TemplateRepository,
    private readonly centralPrisma: CentralPrismaService,
  ) {}

  async execute(templateId: string): Promise<DashboardSummary> {
    const controls = await this.getDashboardControlsUseCase.execute(templateId);
    const withResults = controls.filter((control) => control.compliance !== null);
    const frameworkCompliance = averageCompliance(controls);

    const assets = await this.assetRepository.findAll();
    const serversEvaluated = assets.filter(
      (asset: any) => asset.source === 'WAZUH_AGENT' && asset.external_id && asset.os && asset.status === 'ACTIVE',
    ).length;

    const clientId = RequestContext.clientId;
    const client = clientId
      ? await this.centralPrisma.client.findUnique({ where: { id: clientId }, select: { name: true } })
      : null;

    const contracted = await this.templateRepository.findContracted();
    const contractedTemplates: ContractedTemplateSummary[] = await Promise.all(
      contracted.map(async (tpl) => ({
        id: tpl.id,
        name: tpl.name,
        compliance: averageCompliance(await this.getDashboardControlsUseCase.execute(tpl.id)),
      })),
    );

    return {
      frameworkCompliance,
      controlsCompliant: controls.filter((control) => control.compliance === 100).length,
      controlsEvaluated: withResults.length,
      controlsTotal: controls.length,
      openFindings: controls.reduce((sum, control) => sum + control.checksFailed, 0),
      serversEvaluated,
      companyName: client?.name ?? '',
      assetsCount: assets.length,
      contractedTemplates,
    };
  }
}
