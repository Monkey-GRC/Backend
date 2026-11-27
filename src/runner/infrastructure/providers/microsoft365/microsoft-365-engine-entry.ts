// El arranque propio del motor para Microsoft 365 (D156). El motor solo sabe autenticarse con el certificado de la conexión; las bibliotecas que usa sí aceptan permisos ya emitidos.
// Este texto se copia DENTRO del contenedor efímero y cambia, solo ahí, los puntos donde el motor usaría el certificado, para que reciba únicamente permisos temporales de UNA
// organización: la llave nunca entra (SEG-46). Además informa el avance REAL (verificaciones hechas / total). Si una versión nueva del motor cambia alguno de esos puntos, el
// arranque se detiene en voz alta en vez de caer en silencio a otra forma de entrar. Comprobado con un tenant real: los mismos resultados que con el certificado.
export const MICROSOFT_365_ENGINE_ENTRY_PATH = '/tmp/monkey-entry.py';

export const MICROSOFT_365_ENGINE_ENTRY = `import base64
import contextlib
import os
import re
import sys
import time

from azure.core.credentials import AccessToken, AccessTokenInfo

from prowler.lib.check import check as check_module
from prowler.providers.m365 import m365_provider
from prowler.providers.m365.lib.powershell import m365_powershell

JWT = re.compile(r"^[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+$")
GRAPH = "https://graph.microsoft.com/.default"
EXCHANGE = "https://outlook.office365.com/.default"
TEAMS = "48ac35b8-9aa8-4d74-927d-1f4a14a0b239/.default"


def token(name, required):
    value = os.environ.get(name, "")
    if not value and not required:
        return None
    if not JWT.match(value):
        sys.exit(f"monkey: falta el permiso temporal {name} o no tiene forma de token")
    return value


# El directorio es imprescindible; correo y reuniones pueden faltar (la organización no los tiene): sus verificaciones no corren.
TOKENS = {GRAPH: token("MONKEY_TOKEN_GRAPH", True), EXCHANGE: token("MONKEY_TOKEN_EXCHANGE", False), TEAMS: token("MONKEY_TOKEN_TEAMS", False)}


class PreIssuedCredential:
    """Devuelve el permiso temporal del alcance pedido. Un alcance que no se entregó es un error: no se inventa."""

    def __init__(self, *args, **kwargs):
        # El motor lee estos dos datos para describir la identidad en su reporte. No hay huella: aquí no hay certificado.
        self._client_id = kwargs.get("client_id") or os.environ.get("AZURE_CLIENT_ID", "")
        self._client_credential = {"thumbprint": "sin certificado"}

    def _find(self, scopes):
        value = TOKENS.get(scopes[0] if scopes else "")
        if not value:
            raise RuntimeError("monkey: alcance no entregado")
        return value

    def get_token(self, *scopes, **kwargs):
        return AccessToken(self._find(scopes), int(time.time()) + 3000)

    def get_token_info(self, *scopes, **kwargs):
        return AccessTokenInfo(self._find(scopes), int(time.time()) + 3000)

    def close(self):
        pass


def require(owner, name):
    if not hasattr(owner, name):
        sys.exit(f"monkey: esta versión del motor no tiene {name}; no se puede evaluar sin entregar el certificado")


require(m365_provider, "CertificateCredential")
require(check_module, "alive_bar")
for method in ("init_credential", "connect_exchange_online", "connect_microsoft_teams", "execute", "execute_connect", "sanitize"):
    require(m365_powershell.M365PowerShell, method)


def init_credential(self, credentials):
    self.execute(f'$clientID = "{self.sanitize(credentials.client_id)}"')
    self.execute(f'$tenantID = "{self.sanitize(credentials.tenant_id)}"')
    self.execute(f'$tenantDomain = "{self.sanitize(credentials.tenant_domains[0])}"')
    # Un JWT solo tiene letras, dígitos, punto, guion y guion bajo (comprobado arriba): entre comillas simples no puede cerrar la cadena ni ejecutar nada.
    self.execute(f"$graphToken = '{TOKENS[GRAPH]}'")
    self.execute(f"$exchangeToken = '{TOKENS[EXCHANGE] or ''}'")
    self.execute(f"$teamsToken = '{TOKENS[TEAMS] or ''}'")


def connect_exchange_online(self):
    if not TOKENS[EXCHANGE]:
        return False
    result = self.execute_connect("Connect-ExchangeOnline -AccessToken $exchangeToken -Organization $tenantDomain")
    return "https://aka.ms/exov3-module" in result


def connect_microsoft_teams(self):
    if not TOKENS[TEAMS]:
        return False
    result = self.execute_connect('Connect-MicrosoftTeams -AccessTokens @("$graphToken","$teamsToken")')
    return self.tenant_identity.identity_id in result or "TenantId" in result


class ProgressBar:
    """Reemplaza la barra de texto del motor por líneas que el trabajador sí puede leer."""

    def __init__(self, total):
        self.total, self.done, self.title = int(total or 0), 0, ""

    def __call__(self, *args, **kwargs):
        self.done += 1
        if self.total > 0:
            print(f"MONKEY_PROGRESS {min(self.done, self.total)} {self.total}", flush=True)


@contextlib.contextmanager
def progress_bar(total=None, *args, **kwargs):
    yield ProgressBar(total)


check_module.alive_bar = progress_bar
m365_provider.CertificateCredential = PreIssuedCredential
m365_powershell.M365PowerShell.init_credential = init_credential
m365_powershell.M365PowerShell.connect_exchange_online = connect_exchange_online
m365_powershell.M365PowerShell.connect_microsoft_teams = connect_microsoft_teams

# El motor exige que «haya» un certificado para elegir este camino. Se le da un texto que no es un certificado.
os.environ["M365_CERTIFICATE_CONTENT"] = base64.b64encode(b"sin-certificado").decode()

from prowler.__main__ import prowler  # noqa: E402  (después de los cambios de arriba)

sys.argv[0] = "prowler"
sys.exit(prowler())
`;
