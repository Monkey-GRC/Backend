// Instalador de la sonda para servidores Linux (D113). Lo sirve el backend en `GET /v1/install/agent.sh` (público: no lleva ningún secreto; la clave llega como argumento).
//
// Reglas del archivo (porque es una plantilla de TypeScript): sin acentos graves y sin la secuencia de dólar y llave, que TypeScript interpolaría. Por eso el script usa
// `$VAR` y `$(...)`, nunca la forma con llaves.
//
// Qué hace: valida lo que recibe, instala el paquete de la versión FIJADA desde el repositorio firmado del proveedor (el gestor de paquetes verifica la firma), escribe la
// clave de ESTE servidor, apunta el programa a Monkey y lo arranca. No abre ningún puerto de entrada y no pide contraseñas.
export const AGENT_INSTALL_SH = String.raw`#!/usr/bin/env bash
# Monkey - instalador de la sonda para servidores Linux.
# Uso (como administrador): bash -s -- --manager HOST --port PUERTO --name NOMBRE --version X.Y.Z --key CLAVE
set -e

L=en
case "$LANG" in es*) L=es ;; esac
m() { if [ "$L" = es ]; then printf '%s\n' "$1"; else printf '%s\n' "$2"; fi; }
fail() { printf '\n[Monkey] ERROR: %s\n' "$1" >&2; exit 1; }
failm() { if [ "$L" = es ]; then fail "$1"; else fail "$2"; fi; }

MANAGER=""; PORT="1514"; NAME=""; VERSION=""; KEY=""
while [ "$#" -gt 0 ]; do
  case "$1" in
    --manager|--port|--name|--version|--key)
      [ "$#" -ge 2 ] || failm "Falta el valor de $1." "Missing value for $1."
      case "$1" in
        --manager) MANAGER="$2" ;;
        --port) PORT="$2" ;;
        --name) NAME="$2" ;;
        --version) VERSION="$2" ;;
        --key) KEY="$2" ;;
      esac
      shift 2 ;;
    *) failm "Argumento desconocido: $1" "Unknown argument: $1" ;;
  esac
done

# Todo lo que llega se valida antes de tocar el servidor: nada se interpreta como comando.
printf '%s' "$MANAGER" | grep -Eq '^[A-Za-z0-9]([A-Za-z0-9.-]{0,251}[A-Za-z0-9])?$' || failm "La direccion de Monkey no es valida." "The Monkey address is not valid."
printf '%s' "$PORT" | grep -Eq '^[0-9]{2,5}$' || failm "El puerto no es valido." "The port is not valid."
printf '%s' "$NAME" | grep -Eq '^[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}$' || failm "El identificador del servidor no es valido." "The server identifier is not valid."
printf '%s' "$VERSION" | grep -Eq '^[0-9]+\.[0-9]+\.[0-9]+$' || failm "La version no es valida." "The version is not valid."
printf '%s' "$KEY" | grep -Eq '^[A-Za-z0-9+/]{40,600}={0,2}$' || failm "La clave no tiene el formato esperado. Genera un comando nuevo en Monkey." "The key does not have the expected format. Generate a new command in Monkey."

[ "$(id -u)" -eq 0 ] || failm "Ejecuta este comando como administrador (con sudo)." "Run this command as administrator (with sudo)."

# La clave tiene que ser de ESTE servidor: se decodifica y se comprueba antes de instalar nada.
LINE=$(printf '%s' "$KEY" | base64 -d 2>/dev/null) || failm "La clave no se pudo leer." "The key could not be read."
printf '%s' "$LINE" | grep -Eq "^[0-9]{3,8} $NAME any [0-9a-f]{64}$" || failm "La clave no corresponde a este servidor. Genera un comando nuevo en Monkey." "The key does not match this server. Generate a new command in Monkey."

m "Instalando el programa de Monkey (version $VERSION)..." "Installing the Monkey program (version $VERSION)..."

if command -v apt-get >/dev/null 2>&1; then PM=apt
elif command -v dnf >/dev/null 2>&1; then PM=dnf
elif command -v yum >/dev/null 2>&1; then PM=yum
elif command -v zypper >/dev/null 2>&1; then PM=zypper
else failm "No encontramos apt, dnf, yum ni zypper: esta distribucion no es compatible con este comando." "We could not find apt, dnf, yum or zypper: this distribution is not supported by this command."; fi

REPO_KEY_URL="https://packages.wazuh.com/key/GPG-KEY-WAZUH"

case "$PM" in
  apt)
    export DEBIAN_FRONTEND=noninteractive
    apt-get update -qq >/dev/null
    apt-get install -y -qq curl gnupg ca-certificates >/dev/null
    curl -fsSL "$REPO_KEY_URL" | gpg --dearmor --yes -o /usr/share/keyrings/monkey-sonda.gpg
    printf '%s\n' "deb [signed-by=/usr/share/keyrings/monkey-sonda.gpg] https://packages.wazuh.com/4.x/apt/ stable main" > /etc/apt/sources.list.d/monkey-sonda.list
    apt-get update -qq >/dev/null
    WAZUH_MANAGER="$MANAGER" apt-get install -y -qq "wazuh-agent=$VERSION-1" >/dev/null || failm "No se pudo instalar la version $VERSION." "Could not install version $VERSION."
    ;;
  dnf|yum)
    printf '%s\n' "[monkey-sonda]" "name=Monkey sonda" "baseurl=https://packages.wazuh.com/4.x/yum/" "gpgcheck=1" "gpgkey=$REPO_KEY_URL" "enabled=1" > /etc/yum.repos.d/monkey-sonda.repo
    WAZUH_MANAGER="$MANAGER" "$PM" install -y -q "wazuh-agent-$VERSION-1" >/dev/null || failm "No se pudo instalar la version $VERSION." "Could not install version $VERSION."
    ;;
  zypper)
    rpm --import "$REPO_KEY_URL"
    zypper --non-interactive --quiet addrepo -f https://packages.wazuh.com/4.x/yum/ monkey-sonda >/dev/null 2>&1 || true
    zypper --non-interactive --quiet --gpg-auto-import-keys refresh >/dev/null
    WAZUH_MANAGER="$MANAGER" zypper --non-interactive --quiet install -y "wazuh-agent=$VERSION-1" >/dev/null || failm "No se pudo instalar la version $VERSION." "Could not install version $VERSION."
    ;;
esac

CONF=/var/ossec/etc/ossec.conf
[ -f "$CONF" ] || failm "La instalacion no termino bien." "The installation did not finish correctly."
# A donde se conecta: solo el bloque del servidor.
sed -i "/<server>/,/<\/server>/ s|<address>[^<]*</address>|<address>$MANAGER</address>|" "$CONF"
sed -i "/<server>/,/<\/server>/ s|<port>[0-9]*</port>|<port>$PORT</port>|" "$CONF"

# La clave de este servidor, que Monkey ya creo: el programa no se inscribe por su cuenta ni elige a que empresa pertenece.
printf '%s\n' "$LINE" > /var/ossec/etc/client.keys
chown root:wazuh /var/ossec/etc/client.keys 2>/dev/null || chown root:ossec /var/ossec/etc/client.keys 2>/dev/null || true
chmod 640 /var/ossec/etc/client.keys

if ! timeout 5 bash -c "exec 3<>/dev/tcp/$MANAGER/$PORT" 2>/dev/null; then
  m "AVISO: este servidor no alcanza a Monkey por el puerto $PORT. Pide a quien administre tu red que permita la conexion de SALIDA a $MANAGER:$PORT. No hace falta abrir puertos de entrada." \
    "WARNING: this server cannot reach Monkey on port $PORT. Ask whoever manages your network to allow the OUTBOUND connection to $MANAGER:$PORT. No inbound ports need to be opened."
fi

if command -v systemctl >/dev/null 2>&1 && [ -d /run/systemd/system ]; then
  systemctl daemon-reload
  systemctl enable wazuh-agent >/dev/null 2>&1 || true
  systemctl restart wazuh-agent
else
  /var/ossec/bin/wazuh-control restart >/dev/null
fi

m "Listo. En unos minutos el estado de este servidor cambiara a Conectado en Monkey." "Done. In a few minutes this server's status will change to Connected in Monkey."
`;
