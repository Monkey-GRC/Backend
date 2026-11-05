import { DomainError } from '../../../../common/errors/domain-error';
import { cleanGroupName, isDefaultResponsiblesGroup, isReservedGroupName, planGroupCreation } from './team-group-placement';

const admin = { userId: 'admin-1', role: 'admin_empresa' } as const;
const resp = { userId: 'resp-1', role: 'responsable' } as const;
const forbidden = (fn: () => unknown) => expect(fn).toThrow(expect.objectContaining({ code: 'FORBIDDEN' }));

describe('planGroupCreation', () => {
  it('el administrador sin líder crea un grupo de responsables que lidera él; con líder, el equipo de ese responsable', () => {
    expect(planGroupCreation(admin, null)).toEqual({ kind: 'responsables', leaderId: 'admin-1' });
    expect(planGroupCreation(admin, 'resp-9')).toEqual({ kind: 'team', leaderId: 'resp-9' });
  });

  it('el responsable solo crea su propio equipo: sin líder o con el suyo; con otro, FORBIDDEN', () => {
    expect(planGroupCreation(resp, null)).toEqual({ kind: 'team', leaderId: 'resp-1' });
    expect(planGroupCreation(resp, 'resp-1')).toEqual({ kind: 'team', leaderId: 'resp-1' });
    forbidden(() => planGroupCreation(resp, 'resp-2'));
    forbidden(() => planGroupCreation(resp, 'admin-1'));
  });

  it('cualquier otro rol es FORBIDDEN (segunda barrera tras @Roles)', () => {
    for (const role of ['delegado', 'auditor', 'admin_monkey'] as const) forbidden(() => planGroupCreation({ userId: 'x', role }, null));
    expect(() => planGroupCreation({ userId: 'x', role: 'delegado' }, null)).toThrow(DomainError);
  });
});

describe('nombres de grupo', () => {
  it('cleanGroupName recorta y junta los espacios repetidos', () => {
    expect(cleanGroupName('  Equipo   de  María ')).toBe('Equipo de María');
  });

  it('«Responsables» está reservado sin importar mayúsculas ni espacios, pero no lo están los nombres que lo contienen', () => {
    for (const n of ['Responsables', 'responsables', ' RESPONSABLES ', 'Responsables\t']) expect(isReservedGroupName(n)).toBe(true);
    for (const n of ['Responsables - IA', 'Responsable', 'Los Responsables']) expect(isReservedGroupName(n)).toBe(false);
  });

  it('el grupo por omisión es el de responsables que lleva el nombre reservado: un team con ese nombre (dato viejo) no lo es', () => {
    expect(isDefaultResponsiblesGroup({ name: 'Responsables', kind: 'responsables' })).toBe(true);
    expect(isDefaultResponsiblesGroup({ name: 'Responsables', kind: 'team' })).toBe(false);
    expect(isDefaultResponsiblesGroup({ name: 'Responsables - IA', kind: 'responsables' })).toBe(false);
  });
});
