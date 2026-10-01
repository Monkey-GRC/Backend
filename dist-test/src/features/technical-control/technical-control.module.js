"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TechnicalControlModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const technical_control_repository_1 = require("./domain/repositories/technical-control.repository");
const connection_probe_1 = require("./domain/ports/connection-probe");
const asset_use_cases_1 = require("./application/use-cases/asset.use-cases");
const service_technical_control_use_cases_1 = require("./application/use-cases/service-technical-control.use-cases");
const connection_probe_factory_1 = require("./infrastructure/probes/connection-probe.factory");
const technical_control_prisma_repository_1 = require("./infrastructure/repositories/technical-control.prisma.repository");
const assets_controller_1 = require("./presentation/assets.controller");
const technical_control_controller_1 = require("./presentation/technical-control.controller");
let TechnicalControlModule = class TechnicalControlModule {
};
exports.TechnicalControlModule = TechnicalControlModule;
exports.TechnicalControlModule = TechnicalControlModule = __decorate([
    (0, common_1.Module)({
        controllers: [technical_control_controller_1.TechnicalControlController, assets_controller_1.AssetsController],
        providers: [
            { provide: technical_control_repository_1.TechnicalControlRepository, useClass: technical_control_prisma_repository_1.TechnicalControlPrismaRepository },
            { provide: connection_probe_1.ConnectionProbe, useFactory: connection_probe_factory_1.createConnectionProbe, inject: [config_1.ConfigService] },
            service_technical_control_use_cases_1.GetTechnicalControlUseCase,
            service_technical_control_use_cases_1.SetDeploymentScenarioUseCase,
            service_technical_control_use_cases_1.SetScopeUseCase,
            asset_use_cases_1.CreateAssetUseCase,
            asset_use_cases_1.ListAssetsUseCase,
            asset_use_cases_1.GetAssetUseCase,
            asset_use_cases_1.ValidateAssetUseCase,
            asset_use_cases_1.ActivateAssetUseCase,
            asset_use_cases_1.ScheduleAssetUseCase,
        ],
    })
], TechnicalControlModule);
//# sourceMappingURL=technical-control.module.js.map