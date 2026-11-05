import { isEmailTaken, isGroupNameTaken, isTeamAlreadyExists } from './unique-violation';

describe('isEmailTaken', () => {
  it('reconoce la restricción del correo por target o por la causa del adaptador', () => {
    expect(isEmailTaken({ code: 'P2002', meta: { target: ['email'] } })).toBe(true);
    expect(isEmailTaken({ code: 'P2002', meta: { target: 'users_email_key' } })).toBe(true);
    expect(isEmailTaken({ code: 'P2002', meta: { driverAdapterError: { cause: { constraint: 'users_email_key' } } } })).toBe(true);
    expect(isEmailTaken({ code: 'P2002', meta: { driverAdapterError: { cause: { fields: ['email'] } } } })).toBe(true);
    // La forma real con el adaptador de pg: solo el mensaje original trae el nombre.
    expect(isEmailTaken({ code: 'P2002', meta: { driverAdapterError: { cause: { originalCode: '23505', originalMessage: 'duplicate key value violates unique constraint "users_email_key"' } } } })).toBe(true);
  });

  it('otra restricción única, otro código o nada no son un correo repetido', () => {
    expect(isEmailTaken({ code: 'P2002', meta: { target: ['company_id', 'name'] } })).toBe(false);
    expect(isEmailTaken({ code: 'P2002', meta: { driverAdapterError: { cause: { constraint: 'user_groups_company_id_name_key' } } } })).toBe(false);
    expect(isEmailTaken({ code: 'P2002', meta: { driverAdapterError: { cause: { originalMessage: 'duplicate key value violates unique constraint "user_groups_company_id_name_key"' } } } })).toBe(false);
    expect(isEmailTaken({ code: 'P2002' })).toBe(false);
    expect(isEmailTaken({ code: 'P2003', meta: { target: ['email'] } })).toBe(false);
    expect(isEmailTaken(null)).toBe(false);
    expect(isEmailTaken(new Error('x'))).toBe(false);
  });
});

describe('isGroupNameTaken / isTeamAlreadyExists', () => {
  const pg = (constraint: string) => ({ code: 'P2002', meta: { driverAdapterError: { cause: { originalCode: '23505', originalMessage: `duplicate key value violates unique constraint "${constraint}"` } } } });

  it('cada restricción única es su propio error: no se confunden entre sí ni con el correo', () => {
    expect(isGroupNameTaken(pg('user_groups_company_id_name_key'))).toBe(true);
    expect(isGroupNameTaken({ code: 'P2002', meta: { target: ['company_id', 'name'] } })).toBe(true);
    expect(isTeamAlreadyExists(pg('user_groups_one_team_per_leader'))).toBe(true);
    expect(isTeamAlreadyExists({ code: 'P2002', meta: { target: ['leader_id'] } })).toBe(true);

    expect(isTeamAlreadyExists(pg('user_groups_company_id_name_key'))).toBe(false);
    expect(isGroupNameTaken(pg('user_groups_one_team_per_leader'))).toBe(false);
    expect(isEmailTaken(pg('user_groups_company_id_name_key'))).toBe(false);
    expect(isGroupNameTaken(pg('users_email_key'))).toBe(false);
    expect(isGroupNameTaken({ code: 'P2002', meta: { target: ['email'] } })).toBe(false);
    expect(isTeamAlreadyExists({ code: 'P2003', meta: { target: ['leader_id'] } })).toBe(false);
    expect(isGroupNameTaken(null)).toBe(false);
  });
});
