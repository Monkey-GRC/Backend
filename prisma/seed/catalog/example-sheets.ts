// Un libro de ejemplo, mínimo pero consistente (cumple IN-01…IN-10), para probar el constructor y el validador sin el libro real.
// Un control (CAP-1) con dos puntos de enfoque, un documento con su T-DOC, una prueba técnica con un check de la sonda, uno del motor de nube y un módulo.
import { ChecksIndex } from './checks-cross';
import { Row } from './parse';
import { Sheets } from './build';

export const EXAMPLE_ROW_FIELDS = (over: Row = {}): Row => ({
  'TSC Ref': 'A1.1', 'Categoría TSC': 'Criterios adicionales para la disponibilidad', 'Categoría (corto)': 'Disponibilidad', Dominio: 'Planificación de Capacidad y Rendimiento',
  Criterio: 'La entidad mantiene la capacidad.', 'POC #': 1, 'Punto de Enfoque (Completo)': 'Mide el uso actual', ID: 'CAP-1', Control: 'Evaluación de la capacidad',
  Descripción: 'La organización evalúa la capacidad.', 'DOCUMENTOS / EVIDENCIAS DOCUMENTALES REQUERIDAS': '1- Política\n2- Inventario', Documentos: 'POL-001', Test: 'T-DOC-POL001; T-CAP-1-01',
  'TEST DOCUMENTAL': 'Definido', 'TEST APLICACIÓN': 'N/A', 'TEST SERVIDORES': 'Definido', 'TEST BD': 'N/A', 'TEST NUBE': 'Definido', 'TEST RED': 'N/A', 'FÍSICO Y AMBIENTAL': 'N/A', 'TEST ENDPOINT': 'N/A',
  'TIPO CONTROL': 'Manual dependiente de TI', 'Periodicidad del Control': 'Mensual', 'ROL RESPONSABLE SUGERIDO': 'Líder de Infraestructura / Gerente de TI',
  'EVALUACIÓN DE CONTROL (resultado por cliente)': 'No evaluado', ID_Causa: 'F001', ...over,
});

const testRow = (over: Row): Row => ({
  ID_Control: 'CAP-1', 'Punto de L': 'L2', 'Tipo de test': 'Operativo', Dimensión: 'Servidores', '¿Qué se asegura?': 'Que los servidores en alcance están en el inventario y los revisa Wazuh.', '¿Por qué importa?': 'Sin inventario no hay capacidad.',
  'Fuente principal': 'Wazuh + Prowler', 'Procedimiento estándar': 'PE-MUE-01', 'Paso a paso': '1- Abra el inventario', 'Correcto si': 'Todo coincide', 'Excepción si': 'Falta algo', 'Observación si': 'Diferencias menores',
  'Evidencia a guardar': 'Inventario exportado', Nivel: 'Implementación', 'Frecuencia / muestra': 'Mensual', 'Integración sugerida': 'Nube', Automatización: 'Semiautomático', Estado: 'Definido', ...over,
});

const checkRow = (over: Row): Row => ({
  ID_Test: 'T-CAP-1-01', Herramienta: 'Wazuh SCA', 'Plataforma / Política': 'Ubuntu / CIS Ubuntu 22', 'Check ID': 28500, Título: 't', Rol: 'Directo', 'Existe en catálogo': 'Sí', Plataforma: 'Ubuntu',
  'Servicio / Política': 'CIS Ubuntu 22', 'Objetivo común': 'Capacidad del SO', 'Aplica cuando': 'Agente con la política', ...over,
});

export const exampleSheets = (): Sheets => ({
  matrix: [
    { 'TSC Ref': 'A1.1', Criterio: 'La entidad mantiene la capacidad.', 'POC #': 1, 'Punto de Enfoque (Completo)': 'Mide el uso actual' },
    { 'TSC Ref': 'A1.1', Criterio: 'La entidad mantiene la capacidad.', 'POC #': 2, 'Punto de Enfoque (Completo)': 'Pronostica la capacidad' },
  ],
  controlRows: [EXAMPLE_ROW_FIELDS(), EXAMPLE_ROW_FIELDS({ 'POC #': 2, 'Punto de Enfoque (Completo)': 'Pronostica la capacidad', Dominio: 'Monitoreo Continuo' })],
  requirements: [
    { ID_Requisito: 'CAP-1-L1', ID_Control: 'CAP-1', 'Punto L': 'L1', 'Texto del requisito': 'Política de seguridad', 'Tipo de requisito': 'Documental', ID_Documento: 'POL-001', ID_Test: 'T-DOC-POL001', Periodicidad: 'Mensual', Obligatorio: 'Sí', 'Observación de armado': null },
    { ID_Requisito: 'CAP-1-L2', ID_Control: 'CAP-1', 'Punto L': 'L2', 'Texto del requisito': 'Posible Checks Wazuh', 'Tipo de requisito': 'Técnico', ID_Documento: null, ID_Test: 'T-CAP-1-01', Periodicidad: 'Permanente', Obligatorio: 'Sí', 'Observación de armado': 'Tipo Técnico: todos sus tests son Técnicos.' },
  ],
  tests: [
    testRow({ ID_Test: 'T-DOC-POL001', ID_Control: null, 'Punto de L': 'Documento', 'Tipo de test': 'Documental', Dimensión: 'Documental', '¿Qué se asegura?': 'Que el documento está aprobado.', 'Fuente principal': 'Documento', 'Procedimiento estándar': 'PE-DOC-01', Nivel: 'Diseño', 'Integración sugerida': 'N/A', Automatización: 'Manual' }),
    testRow({ ID_Test: 'T-CAP-1-01' }),
  ],
  testChecks: [
    checkRow({}),
    checkRow({ Herramienta: 'Prowler', 'Plataforma / Política': 'AWS / rds', 'Check ID': 'rds_instance_deprecated_engine_version', Rol: 'Complementario', Plataforma: 'AWS', 'Servicio / Política': 'rds' }),
    checkRow({ Herramienta: 'Wazuh – módulo', 'Plataforma / Política': 'FIM (monitoreo de integridad de archivos)', 'Check ID': 'N/A', Plataforma: 'Wazuh (agente)', 'Servicio / Política': 'FIM (monitoreo de integridad de archivos)', 'Existe en catálogo': 'Módulo' }),
  ],
  procedures: [
    { Código: 'PE-DOC-01', Nombre: 'Prueba documental', 'Cuándo se usa': 'Cuando hay un documento', 'Pasos genéricos': '1- Abra el documento', 'Evidencia típica': 'Registro de Monkey' },
    { Código: 'PE-MUE-01', Nombre: 'Muestra operativa', 'Cuándo se usa': 'Cuando hay una muestra', 'Pasos genéricos': '1- Tome la muestra', 'Evidencia típica': 'La muestra' },
  ],
  integrations: [{ Categoría: 'Nube', 'Herramientas tales como…': 'Herramientas tales como AWS o Azure', 'Controles que alimenta': 'CAP-1', 'Qué evidencia aporta': 'Configuración', Procedimiento: 'PE-MUE-01' }],
  documents: [
    {
      Código: 'POL-001', Tipo: 'Política', 'Documento relacionado': 'Política de seguridad de la información', Descripción: 'Lineamientos generales.', 'Códigos de control relacionados': 'CAP-1', 'ID_Test documental': 'T-DOC-POL001',
      'Contenido mínimo exigido': '1- Objetivo', 'Periodicidad de revisión': 'Anual', 'Rol aprobador sugerido': 'Gerente General', 'Rol responsable sugerido del documento': 'CISO', Origen: 'Interno', 'Aceptación del personal (sugerida)': 'Todos los usuarios',
    },
  ],
  mappings: [
    { ID_Control: 'CAP-1', Marco: 'SOC 2 TSC 2017 (rev. 2022)', 'Requisito del marco': 'A1.1 POC 1', 'Tipo de relación': 'Directa', Justificación: 'Asignado en Controles Monkey' },
    { ID_Control: 'CAP-1', Marco: 'SOC 2 TSC 2017 (rev. 2022)', 'Requisito del marco': 'A1.1 POC 2', 'Tipo de relación': 'Directa', Justificación: 'Asignado en Controles Monkey' },
  ],
  risks: [
    {
      ID_Riesgo: 'R001', Riesgo: 'Indisponibilidad', Descripción: 'Interrupción de sistemas.', Criterio: 'Disponibilidad', Impacto_Potencial: 'Pérdida financiera; Reputacional', 'Probabilidad inherente [CATEGORÍA]': '3 - Posible',
      'Impacto inherente [CATEGORÍA]': '4 - Mayor', 'Valor riesgo inherente (1-25)': 12, 'Nivel riesgo inherente': 'Crítico', ID_Causa: 'F001',
    },
  ],
  causes: [{ ID_Causa: 'F001', Origen: 'INTERNO', Tipo_Causa: 'Humano (personas)', Descripción_Causa: 'El personal desconoce los procesos.', ID_Riesgo: 'R001', ID_Control: 'CAP-1' }],
});

export const exampleChecksIndex = (): ChecksIndex => ({
  sondaPolicy: (label, benchmark) => (label === 'Ubuntu' && benchmark === 'CIS Ubuntu 22' ? { platform: 'ubuntu', policyId: 'cis_ubuntu22-04' } : null),
  hasSondaCheck: (platform, policyId, checkId) => platform === 'ubuntu' && policyId === 'cis_ubuntu22-04' && checkId === '28500',
  cloudPlatform: (label) => (label === 'AWS' ? 'aws' : label === 'GCP' ? 'gcp' : null),
  hasCloudCheck: (platform, checkId) => platform === 'aws' && checkId === 'rds_instance_deprecated_engine_version',
});

export const EXAMPLE_SOURCE = { sourceFile: 'ejemplo.xlsx', sourceSha256: 'abc', sondaVersion: '4.14.7', cloudEngineVersion: '5.45.0' };
