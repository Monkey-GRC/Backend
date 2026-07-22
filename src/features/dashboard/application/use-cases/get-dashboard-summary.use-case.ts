import { Injectable } from '@nestjs/common';
import { GetDashboardControlsUseCase } from './get-dashboard-controls.use-case';

export type DashboardSummary = {
  frameworkCompliance: number | null;
  controlsCompliant: number;
  controlsTotal: number;
  openFindings: number;
};

@Injectable()
export class GetDashboardSummaryUseCase {
  constructor(
    private readonly getDashboardControlsUseCase: GetDashboardControlsUseCase,
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

    return {
      frameworkCompliance,
      controlsCompliant: controls.filter(
        (control) => control.compliance === 100,
      ).length,
      controlsTotal: controls.length,
      openFindings: controls.reduce(
        (sum, control) => sum + control.checksFailed,
        0,
      ),
    };
  }
}
