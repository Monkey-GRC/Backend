import { Global, Module } from '@nestjs/common';
import { ComplianceReadings } from '../../common/compliance/compliance-readings.port';
import { ComplianceReadingsPrisma } from './infrastructure/readings/compliance-readings.prisma';

// MD-502 · Lo que compliance deja leer a otras features (el puerto `ComplianceReadings`): la lectura del motor v2 de una prueba y la foto de estados de un control. No arrastra controllers.
@Global()
@Module({
  providers: [{ provide: ComplianceReadings, useClass: ComplianceReadingsPrisma }],
  exports: [ComplianceReadings],
})
export class ComplianceReadingsModule {}
