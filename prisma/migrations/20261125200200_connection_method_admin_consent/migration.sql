-- D157: «Conectar Microsoft 365» con un botón. El cliente autoriza la aplicación de Monkey: no hay secretos suyos ni certificado por conexión.
-- Aditiva: solo agrega un valor al enum.
ALTER TYPE tenant.connection_method ADD VALUE IF NOT EXISTS 'admin_consent';
