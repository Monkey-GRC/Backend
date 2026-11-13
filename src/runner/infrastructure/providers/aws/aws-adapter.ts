import type { CloudAdapter } from '../cloud-adapters';
import { AwsInventoryScanner } from './aws-inventory-scanner';
import { prowlerAwsProfile } from './aws-engine-profile';
import { StsCredentialBroker } from './sts-credential-broker';

export const createAwsAdapter = (engineImage: string): CloudAdapter => ({
  broker: new StsCredentialBroker(),
  engineProfile: prowlerAwsProfile(engineImage),
  inventory: new AwsInventoryScanner(),
});
