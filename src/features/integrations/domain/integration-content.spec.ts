import { MICROSOFT_365_GRAPH_PERMISSIONS } from '../../technical-control/infrastructure/templates/microsoft-365-app.template';
import { INTEGRATION_CONTENT } from './integration-content';

describe('contenido de las integraciones', () => {
  it('Microsoft 365 muestra exactamente los permisos que de verdad se piden: ni uno de más ni uno de menos', () => {
    const shown = INTEGRATION_CONTENT.microsoft_365.permissions.flatMap((p) => (p.scope ?? '').split(' · '));
    expect([...shown].sort()).toEqual([...MICROSOFT_365_GRAPH_PERMISSIONS, 'Exchange.ManageAsApp'].sort());
  });

  it('solo las construidas tienen permisos y temas de seguridad: lo demás no promete nada que el comité no decidió', () => {
    for (const [code, c] of Object.entries(INTEGRATION_CONTENT)) {
      if (code === 'aws' || code === 'microsoft_365') continue;
      expect(c).toEqual({ resourceTypes: [], permissions: [], security: [], full: false });
    }
    expect(INTEGRATION_CONTENT.aws.security).toHaveLength(6);
    expect(INTEGRATION_CONTENT.aws.permissions.map((p) => p.access)).toEqual(['read', 'read', 'read']);
  });

  it('las siete del catálogo están', () => {
    expect(Object.keys(INTEGRATION_CONTENT)).toEqual(['aws', 'azure', 'gcp', 'microsoft_365', 'google_workspace', 'github', 'jira']);
  });
});
