import type { ControlTestItem } from '../../application/controls/list-control-tests.use-case';
import { neutralName } from './control-response.mapper';

type Translate = (key: string) => string;

// Un test de un control al JSON del contrato (compliance-audit.md). El nombre es el neutro (D70): el texto del comité no sale.
export const toControlTestItem = (i: ControlTestItem, t: Translate) => ({
  test_id: i.test.testId,
  test_code: i.test.code,
  display_name: neutralName(i.test, i.test.dimension, t),
  dimension: i.test.dimension,
  type: i.type,
  is_mandatory: i.test.mandatory,
  is_active: i.test.active,
  shared_with: i.sharedWith,
  state: i.state,
  ai_suggestion: null,
});
