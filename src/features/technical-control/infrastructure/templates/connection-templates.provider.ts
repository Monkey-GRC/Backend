import { Injectable } from '@nestjs/common';
import { ConnectionTemplates } from '../../application/connection-templates';
import { AWS_READONLY_ROLE_TEMPLATE } from './aws-readonly-role.template';
import { buildGcpSetupCommand, renderGcpSetupScript } from './gcp-identity-federation.template';
import { buildMicrosoft365SetupCommand, renderMicrosoft365SetupScript } from './microsoft-365-app.template';

@Injectable()
export class StaticConnectionTemplates extends ConnectionTemplates {
  awsReadonlyRole = () => AWS_READONLY_ROLE_TEMPLATE;
  gcpSetupScript = renderGcpSetupScript;
  gcpSetupCommand = buildGcpSetupCommand;
  microsoft365SetupScript = renderMicrosoft365SetupScript;
  microsoft365SetupCommand = buildMicrosoft365SetupCommand;
}
