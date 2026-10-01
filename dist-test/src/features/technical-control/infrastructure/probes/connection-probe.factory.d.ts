import { ConfigService } from '@nestjs/config';
import { ConnectionProbe } from '../../domain/ports/connection-probe';
export declare function createConnectionProbe(config: ConfigService): ConnectionProbe;
