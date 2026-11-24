-- MD-500 · La tarea diaria busca el último evento de estado de cada control de un servicio (DISTINCT ON control). Índice parcial por expresión, aditivo.
CREATE INDEX "compliance_events_state_last_idx" ON "audit"."compliance_events"("tenant_id", (new_value->>'service_id'), (new_value->>'control_id'), "created_at" DESC, "id" DESC) WHERE "changed_field" = 'control.state';
