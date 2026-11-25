-- MD-515, SEG-87 · SQL a mano, aparte del cambio de schema (20261125100000): RLS POR PERSONA, permisos mínimos e índices parciales de `platform.notifications` y `platform.notification_digests`. ADITIVA.
--
-- Un aviso solo lo lee y lo marca su destinatario (`app.user_id`): ni otra persona de la empresa, ni el `admin_empresa`, ni otra empresa. NO hay política `tenant_isolation` abierta a toda la empresa.
-- El sistema inserta con la persona que causa el hecho (o sin ninguna, en la pasada diaria) y SIN `RETURNING`, como `audit_logs`: un `INSERT … RETURNING` exigiría pasar también la política de lectura.
ALTER TABLE platform.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform.notifications FORCE ROW LEVEL SECURITY;

CREATE POLICY notifications_read_own ON platform.notifications FOR SELECT
  USING (company_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid
     AND user_id = NULLIF(current_setting('app.user_id', true), '')::uuid);

CREATE POLICY notifications_insert ON platform.notifications FOR INSERT
  WITH CHECK (company_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

CREATE POLICY notifications_mark_own ON platform.notifications FOR UPDATE
  USING (company_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid
     AND user_id = NULLIF(current_setting('app.user_id', true), '')::uuid)
  WITH CHECK (company_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid
          AND user_id = NULLIF(current_setting('app.user_id', true), '')::uuid);

-- Borrar: ninguna política. Una sesión de persona nunca borra un aviso (ni el suyo) y la retención de 90 días la hace `platform.purge_expired_notifications` (20261125100300), que no es ninguna persona.
-- (Un `DELETE … WHERE` también pasa por la política de lectura; abrirla a «lo viejo, sin persona» dejaría al sistema ver avisos de todos.)

-- El contenido es inmutable: de un aviso la app solo puede cambiar cuándo se leyó y cuándo entró en un resumen.
REVOKE UPDATE ON platform.notifications FROM monkey_app;
GRANT UPDATE (read_at, emailed_at) ON platform.notifications TO monkey_app;

-- El contador de la campana (no leídos de una persona) y la lista de los no enviados por correo.
CREATE INDEX notifications_unread_idx ON platform.notifications (user_id, created_at DESC) WHERE read_at IS NULL;

-- El resumen: aislamiento estándar por empresa (la tarea lo escribe como la persona destinataria, con la empresa fijada).
ALTER TABLE platform.notification_digests ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform.notification_digests FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON platform.notification_digests
  USING (company_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (company_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);
