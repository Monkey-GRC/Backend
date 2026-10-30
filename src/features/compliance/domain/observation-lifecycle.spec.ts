import { DomainError } from '../../../common/errors/domain-error';
import { assertCanAnswer, assertCanResolve, assertEditable, ObservationStatus } from './observation-lifecycle';

const code = (fn: () => void): string | null => {
  try {
    fn();
    return null;
  } catch (e) {
    return (e as DomainError).code;
  }
};

// §7.6 · Qué se puede hacer con una observación según su estado, y qué error responde cuando no.
describe('ciclo de vida de una observación', () => {
  it.each<[ObservationStatus, string | null]>([
    ['open', null],
    ['answered', null],
    ['closed', 'OBSERVATION_CLOSED'],
  ])('editar el texto estando %s → %s', (status, expected) => expect(code(() => assertEditable(status))).toBe(expected));

  it.each<[ObservationStatus, string | null]>([
    ['open', null],
    ['answered', 'OBSERVATION_NOT_OPEN'],
    ['closed', 'OBSERVATION_CLOSED'],
  ])('responder estando %s → %s', (status, expected) => expect(code(() => assertCanAnswer(status))).toBe(expected));

  it.each<[ObservationStatus, string | null]>([
    ['open', 'INVALID_TRANSITION'],
    ['answered', null],
    ['closed', 'OBSERVATION_CLOSED'],
  ])('cerrar o devolver estando %s → %s', (status, expected) => expect(code(() => assertCanResolve(status))).toBe(expected));

  it('una cerrada no admite nada, y ese error manda sobre los demás', () => {
    for (const fn of [assertEditable, assertCanAnswer, assertCanResolve]) expect(code(() => fn('closed'))).toBe('OBSERVATION_CLOSED');
  });
});
