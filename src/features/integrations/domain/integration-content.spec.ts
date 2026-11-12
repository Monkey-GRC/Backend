import { INTEGRATION_CONTENT } from './integration-content';

describe('contenido de las integraciones', () => {
  it('solo AWS tiene permisos y temas de seguridad: lo demás no promete nada que el comité no decidió', () => {
    for (const [code, c] of Object.entries(INTEGRATION_CONTENT)) {
      if (code === 'aws') continue;
      expect(c).toEqual({ resourceTypes: [], permissions: [], security: [], full: false });
    }
    expect(INTEGRATION_CONTENT.aws.security).toHaveLength(6);
    expect(INTEGRATION_CONTENT.aws.permissions.map((p) => p.access)).toEqual(['read', 'read', 'read']);
  });

  it('las siete del catálogo están', () => {
    expect(Object.keys(INTEGRATION_CONTENT)).toEqual(['aws', 'azure', 'gcp', 'microsoft_365', 'google_workspace', 'github', 'jira']);
  });
});
