import { Injectable } from '@nestjs/common';
import { AssetRepository } from 'src/features/asset/domain/repositories/asset.repository';
import { GetDashboardControlsUseCase } from './get-dashboard-controls.use-case';

export type DashboardSummary = {
  /** % de cumplimiento calculado solo sobre los controles ya evaluados (ver controlsEvaluated). */
  frameworkCompliance: number | null;
  controlsCompliant: number;
  /** Controles con al menos un check evaluado (no todo PENDING/sin checks) — cobertura de la evaluación. */
  controlsEvaluated: number;
  /** Todos los controles del framework: AUTOMATIC + MANUAL + HYBRID. */
  controlsTotal: number;
  openFindings: number;
  /** Servidores registrados y activos (origen Wazuh) considerados en este resumen. */
  serversEvaluated: number;
};

@Injectable()
export class GetDashboardSummaryUseCase {
  constructor(
    private readonly getDashboardControlsUseCase: GetDashboardControlsUseCase,
    private readonly assetRepository: AssetRepository,
  ) {}

  async execute(): Promise<DashboardSummary> {
    const controls = await this.getDashboardControlsUseCase.execute();
    const withResults = controls.filter(
      (control) => control.compliance !== null,
    );

    const frameworkCompliance =
      withResults.length === 0
        ? null
        : Math.round(
            (withResults.reduce(
              (sum, control) => sum + (control.compliance ?? 0),
              0,
            ) /
              withResults.length) *
              100,
          ) / 100;

    const assets = await this.assetRepository.findAll();
    const serversEvaluated = assets.filter(
      (asset: any) => asset.source === 'WAZUH_AGENT' && asset.external_id && asset.os && asset.status === 'ACTIVE',
    ).length;

    return {
      frameworkCompliance,
      controlsCompliant: controls.filter(
        (control) => control.compliance === 100,
      ).length,
      controlsEvaluated: withResults.length,
      controlsTotal: controls.length,
      openFindings: controls.reduce(
        (sum, control) => sum + control.checksFailed,
        0,
      ),
      serversEvaluated,
    };
  }
}
