import { Logger } from '@nestjs/common';
import { LogMailer } from './log.mailer';

// SEG-75 · El adaptador de log escribe el cuerpo de un correo normal (la clave de acceso de D99 en local), pero nunca el de uno confidencial.
describe('LogMailer', () => {
  const warn = jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
  afterEach(() => warn.mockClear());
  afterAll(() => warn.mockRestore());

  it('escribe el cuerpo de un correo normal', async () => {
    await new LogMailer().send({ to: 'a@a.test', subject: 'S', text: 'MNK-AAAA-BBBB-CCCC' });
    expect(String(warn.mock.calls[0][0])).toContain('MNK-AAAA-BBBB-CCCC');
  });

  it('omite el cuerpo de un correo confidencial', async () => {
    await new LogMailer().send({ to: 'a@a.test', subject: 'S', text: 'MNK-AAAA-BBBB-CCCC', html: '<p>MNK-AAAA-BBBB-CCCC</p>', confidential: true });
    const line = String(warn.mock.calls[0][0]);
    expect(line).toContain('a@a.test');
    expect(line).not.toContain('MNK-');
  });
});
