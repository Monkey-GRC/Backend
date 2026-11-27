# Desplegar «Conectar Microsoft 365» (D157)

Para quien administra el servidor de desarrollo. Todo se hace **una sola vez**. Si no se hace, el despliegue sigue funcionando y el botón responde «no disponible».

## Qué hace solo el despliegue

- Aplica las migraciones nuevas (todas aditivas: agregan columnas, un índice, un valor de enum y cambian el orden de la cola).
- Recarga los datos de referencia y los checks (`migrate.sh`).
- `check-env.sh` **detiene el despliegue** si Microsoft 365 quedó configurado a medias o si el trabajador no podría leer la llave.

El backend y el trabajador deben actualizarse **juntos** (cambió lo que el backend le entrega al trabajador). `deploy-dev.yml` ya reconstruye los dos.

## Pasos manuales

1. **Registrar la aplicación de Monkey para el servidor** (desde un equipo con Docker, en `Backend`). Es distinta de la de pruebas en local:

   ```bash
   npx tsx scripts/dev/microsoft-app-register.ts <ID-del-tenant-de-Monkey> https://api-dev.monkey360.io/v1
   ```

   Crea la llave y el certificado en `~/.monkey-microsoft-app/` de ese equipo e imprime el ID de la aplicación. **Si ya registraste la de local en ese equipo**, mueve antes esa carpeta: cada entorno tiene su propia llave.

2. **Copiar la llave y el certificado al servidor** por un canal cifrado (`scp`), nunca por chat, correo ni un repositorio:

   ```bash
   scp ~/.monkey-microsoft-app/llave.pem        ubuntu@<vps>:~/monkey-dev/runner-secrets/m365-llave.pem
   scp ~/.monkey-microsoft-app/certificado.pem  ubuntu@<vps>:~/monkey-dev/runner-secrets/m365-certificado.pem
   ```

3. **Permisos** (en el servidor). Obligatorio: el trabajador corre sin capacidades y con permisos `600` de otro usuario **no puede leerlos**.

   ```bash
   cd ~/monkey-dev/runner-secrets
   sudo chown root:root m365-llave.pem m365-certificado.pem
   sudo chmod 400 m365-llave.pem
   sudo chmod 444 m365-certificado.pem
   ```

4. **Variables** (en el servidor):

   ```bash
   S=~/monkey-dev/backend/scripts/deploy/set-env.sh
   bash $S ~/monkey-dev/.env       M365_APP_CLIENT_ID=<id> M365_CALLBACK_BASE_URL=https://api-dev.monkey360.io/v1
   bash $S ~/monkey-dev/runner.env M365_APP_CLIENT_ID=<id> M365_APP_KEY_FILE=/run/secrets/m365-llave.pem M365_APP_CERT_FILE=/run/secrets/m365-certificado.pem
   bash ~/monkey-dev/backend/scripts/deploy/check-env.sh ~/monkey-dev
   ```

   `PLATFORM_APP_URL` debe ser la dirección pública de la plataforma: ahí vuelve el administrador desde Microsoft.

5. **El `docker-compose.yml` del servidor** (`~/monkey-dev/`) no lo actualiza el despliegue. Comprobar que el servicio `runner` monta `./runner-secrets:/run/secrets:ro` (ya lo hacía para la sonda) y subir `mem_limit` a `1g` (antes `256m`).

6. Reiniciar: `cd ~/monkey-dev && docker compose up -d backend runner`. El registro del trabajador debe decir `Aplicación de Monkey para Microsoft 365: sí`.

## Concurrencia

`ENGINE_CONCURRENCY` (por defecto 1) es cuántas evaluaciones corren a la vez. Cada una usa hasta 2 GB y 2 CPU: súbelo solo si el servidor aguanta la suma.

## Antes de abrirlo a clientes reales (no aplica al servidor de desarrollo)

Ver `DT-132`: la llave debe vivir en un almacén que firme sin entregarla, con rotación y vigilancia; además, revisión de seguridad y verificación de editor ante Microsoft.

## Al actualizar la imagen del motor

El arranque de Microsoft 365 depende de partes internas del motor (`microsoft-365-engine-entry.ts`). Cada cambio de `ENGINE_IMAGE` exige repetir la prueba con una organización real (`scripts/dev/entra-smoke.ts`).
