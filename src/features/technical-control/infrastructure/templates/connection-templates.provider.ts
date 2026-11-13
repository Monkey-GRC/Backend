import { Injectable } from '@nestjs/common';
import { ConnectionTemplates } from '../../application/connection-templates';
import { AWS_READONLY_ROLE_TEMPLATE } from './aws-readonly-role.template';
import { buildGcpSetupCommand, renderGcpSetupScript } from './gcp-identity-federation.template';

@Injectable()
export class StaticConnectionTemplates extends ConnectionTemplates {
  awsReadonlyRole = () => AWS_READONLY_ROLE_TEMPLATE;
  gcpSetupScript = renderGcpSetupScript;
  gcpSetupCommand = buildGcpSetupCommand;
}
