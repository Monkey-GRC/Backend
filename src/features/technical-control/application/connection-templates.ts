// Lo que el cliente ejecuta o crea en SU nube para dar acceso de solo lectura a Monkey. Puerto: lo implementa `infrastructure/templates/`; presentation y los
// casos de uso solo conocen esta forma.
export abstract class ConnectionTemplates {
  abstract awsReadonlyRole(): string;
  // El script de alta de GCP con la cuenta y el rol de Monkey horneados (D112).
  abstract gcpSetupScript(federationRoleArn: string): string;
  // El comando para pegar en Cloud Shell: el script completo con los parámetros ya puestos.
  abstract gcpSetupCommand(federationRoleArn: string, projectId: string, externalId: string): string;
  // El script de alta de Microsoft 365 (D154): no lleva nada de ningún cliente.
  abstract microsoft365SetupScript(): string;
  // El comando para pegar en Azure Cloud Shell: el script completo, el tenant y el certificado PÚBLICO de la conexión.
  abstract microsoft365SetupCommand(tenantId: string, certificatePem: string): string;
}
