"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServicesModule = void 0;
const common_1 = require("@nestjs/common");
const service_repository_1 = require("./domain/repositories/service.repository");
const create_service_use_case_1 = require("./application/use-cases/create-service.use-case");
const delete_service_use_case_1 = require("./application/use-cases/delete-service.use-case");
const get_service_use_case_1 = require("./application/use-cases/get-service.use-case");
const list_services_use_case_1 = require("./application/use-cases/list-services.use-case");
const set_system_description_use_case_1 = require("./application/use-cases/set-system-description.use-case");
const update_service_use_case_1 = require("./application/use-cases/update-service.use-case");
const service_prisma_repository_1 = require("./infrastructure/repositories/service.prisma.repository");
const services_controller_1 = require("./presentation/services.controller");
let ServicesModule = class ServicesModule {
};
exports.ServicesModule = ServicesModule;
exports.ServicesModule = ServicesModule = __decorate([
    (0, common_1.Module)({
        controllers: [services_controller_1.ServicesController],
        providers: [
            { provide: service_repository_1.ServiceRepository, useClass: service_prisma_repository_1.ServicePrismaRepository },
            create_service_use_case_1.CreateServiceUseCase,
            list_services_use_case_1.ListServicesUseCase,
            get_service_use_case_1.GetServiceUseCase,
            update_service_use_case_1.UpdateServiceUseCase,
            delete_service_use_case_1.DeleteServiceUseCase,
            set_system_description_use_case_1.SetSystemDescriptionUseCase,
        ],
    })
], ServicesModule);
//# sourceMappingURL=services.module.js.map