import { COMPLIANCE_ENUM_CATALOGS } from '../../../../common/catalogs/compliance-catalogs';
import { MANAGEMENT_ACTIONS } from '../../domain/management/allowed-actions';
import { HISTORY_TYPES } from '../../domain/management/management-history.repository';
import { LEVELS } from '../../domain/controls/management-extras';
import { WORK_DECISION_KINDS } from '../work/work-listing';

// MD-529 · Los catálogos de `GET /v1/catalogs/{nombre}` salen de listas escritas aparte (common no importa de las features): esta prueba vigila que no se separen de las que emite el código.
describe('catálogos de gestión = lo que emite el código', () => {
  it.each([
    ['work_decision_kind', WORK_DECISION_KINDS],
    ['management_action', MANAGEMENT_ACTIONS],
    ['management_history_type', HISTORY_TYPES],
    ['control_level', LEVELS],
  ] as const)('%s', (name, emitted) => {
    expect([...COMPLIANCE_ENUM_CATALOGS[name]]).toEqual([...emitted]);
  });
});
