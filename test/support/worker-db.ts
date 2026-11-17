// setupFiles de jest e2e: apunta TEST_DATABASE_URL a la base de ESTE worker (`<plantilla>_w<JEST_WORKER_ID>`) antes de
// que nada conecte. test/support/global-setup.ts es quien las crea.
const url = process.env.TEST_DATABASE_URL;
if (url) {
  const parsed = new URL(url);
  const template = parsed.pathname.slice(1).replace(/_w\d+$/, '');
  parsed.pathname = `/${template}_w${process.env.JEST_WORKER_ID ?? '1'}`;
  process.env.TEST_DATABASE_URL = parsed.toString();
}
