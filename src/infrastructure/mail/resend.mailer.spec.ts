import { ResendMailer } from './resend.mailer';

// Un error del adaptador nunca lleva el cuerpo del mensaje ni al destinatario: puede traer una clave de acceso.
const msg = { to: 'secreto@acme.test', subject: 'S', text: 'MNK-AAAA-BBBB-CCCC' };

describe('ResendMailer', () => {
  const fetchMock = jest.spyOn(global, 'fetch');
  afterEach(() => fetchMock.mockReset());
  afterAll(() => fetchMock.mockRestore());

  it('envía por HTTP con la credencial y el remitente', async () => {
    fetchMock.mockResolvedValue(new Response('{}', { status: 200 }));
    await new ResendMailer('re_key', 'Monkey <no-reply@x.test>').send(msg);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://api.resend.com/emails');
    expect((init!.headers as Record<string, string>).Authorization).toBe('Bearer re_key');
    expect(JSON.parse(init!.body as string)).toMatchObject({ from: 'Monkey <no-reply@x.test>', to: ['secreto@acme.test'], subject: 'S' });
  });

  it('manda también la versión HTML cuando el mensaje la trae', async () => {
    fetchMock.mockResolvedValue(new Response('{}', { status: 200 }));
    await new ResendMailer('k', 'f').send({ ...msg, html: '<p>hola</p>' });
    expect(JSON.parse(fetchMock.mock.calls[0][1]!.body as string)).toMatchObject({ text: msg.text, html: '<p>hola</p>' });
  });

  it('un rechazo lanza con el estado y el tipo, sin el mensaje ni el destinatario', async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ name: 'daily_quota_exceeded', message: 'secreto@acme.test MNK-AAAA-BBBB-CCCC' }), { status: 429 }));
    const error = await new ResendMailer('k', 'f').send(msg).catch((e: Error) => e);
    expect((error as Error).message).toContain('429');
    expect((error as Error).message).toContain('daily_quota_exceeded');
    expect((error as Error).message).not.toContain('secreto@acme.test');
    expect((error as Error).message).not.toContain('MNK-');
  });

  it('si la red falla lanza sin detalles del mensaje', async () => {
    fetchMock.mockRejectedValue(Object.assign(new Error('connect ECONNREFUSED secreto@acme.test'), { name: 'TypeError' }));
    const error = await new ResendMailer('k', 'f').send(msg).catch((e: Error) => e);
    expect((error as Error).message).not.toContain('secreto@acme.test');
  });
});
