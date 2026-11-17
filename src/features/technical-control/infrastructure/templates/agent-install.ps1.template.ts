// Instalador de la sonda para servidores Windows (D113). Lo sirve el backend en `GET /v1/install/agent.ps1` (público: no lleva ningún secreto) y, para quien prefiere un
// archivo, se entrega con los datos de ESE servidor ya escritos dentro (la clave sale una sola vez, junto con el comando).
//
// Reglas del archivo (plantilla de TypeScript): sin acentos graves y sin la secuencia de dólar y llave. Por eso el script usa `$(...)` y evaluadores de bloque en vez de
// la sintaxis con llaves.
//
// El marcador __PARAMS__ se reemplaza por el bloque `param(...)` (cuando se descarga y se ejecuta con argumentos) o por las asignaciones directas (el archivo ya completo).
export const AGENT_INSTALL_PS1_PARAMS = `param(
  [Parameter(Mandatory = $true)][string]$Manager,
  [int]$Port = 1514,
  [Parameter(Mandatory = $true)][string]$Name,
  [Parameter(Mandatory = $true)][string]$Version,
  [Parameter(Mandatory = $true)][string]$Key
)`;

export const AGENT_INSTALL_PS1 = String.raw`# Monkey - instalador de la sonda para servidores Windows.
# Ejecutalo en PowerShell como administrador.
__PARAMS__

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

$script:IsEs = ((Get-Culture).TwoLetterISOLanguageName -eq 'es')
function Say([string]$es, [string]$en) { if ($script:IsEs) { Write-Host $es } else { Write-Host $en } }
function Fail([string]$es, [string]$en) { Say ('ERROR: ' + $es) ('ERROR: ' + $en); exit 1 }

# Todo lo que llega se valida antes de tocar el servidor: nada se interpreta como comando.
if ($Manager -notmatch '^[A-Za-z0-9]([A-Za-z0-9.-]{0,251}[A-Za-z0-9])?$') { Fail 'La direccion de Monkey no es valida.' 'The Monkey address is not valid.' }
if ($Port -lt 1 -or $Port -gt 65535) { Fail 'El puerto no es valido.' 'The port is not valid.' }
if ($Name -notmatch '^[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}$') { Fail 'El identificador del servidor no es valido.' 'The server identifier is not valid.' }
if ($Version -notmatch '^[0-9]+\.[0-9]+\.[0-9]+$') { Fail 'La version no es valida.' 'The version is not valid.' }
if ($Key -notmatch '^[A-Za-z0-9+/]{40,600}={0,2}$') { Fail 'La clave no tiene el formato esperado. Genera un comando nuevo en Monkey.' 'The key does not have the expected format. Generate a new command in Monkey.' }

$identity = [Security.Principal.WindowsIdentity]::GetCurrent()
$principal = New-Object Security.Principal.WindowsPrincipal($identity)
if (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
  Fail 'Abre PowerShell como administrador y vuelve a ejecutarlo.' 'Open PowerShell as administrator and run it again.'
}

# La clave tiene que ser de ESTE servidor: se decodifica y se comprueba antes de instalar nada.
try { $line = [Text.Encoding]::ASCII.GetString([Convert]::FromBase64String($Key)) } catch { Fail 'La clave no se pudo leer.' 'The key could not be read.' }
if ($line -notmatch ('^[0-9]{3,8} ' + [regex]::Escape($Name) + ' any [0-9a-f]{64}$')) {
  Fail 'La clave no corresponde a este servidor. Genera un comando nuevo en Monkey.' 'The key does not match this server. Generate a new command in Monkey.'
}

Say ('Instalando el programa de Monkey (version ' + $Version + ')...') ('Installing the Monkey program (version ' + $Version + ')...')

[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$msiUrl = 'https://packages.wazuh.com/4.x/windows/wazuh-agent-' + $Version + '-1.msi'
$msi = Join-Path $env:TEMP ('monkey-agent-' + $Version + '.msi')
Invoke-WebRequest -UseBasicParsing -Uri $msiUrl -OutFile $msi

# El instalador viene firmado: si la firma no es valida, no se instala.
$signature = Get-AuthenticodeSignature -FilePath $msi
if ($signature.Status -ne 'Valid') { Fail 'La firma del instalador no es valida; no se instalo nada.' 'The installer signature is not valid; nothing was installed.' }

$msiArgs = @('/i', ('"' + $msi + '"'), '/qn', ('WAZUH_MANAGER="' + $Manager + '"'))
$process = Start-Process -FilePath 'msiexec.exe' -ArgumentList $msiArgs -Wait -PassThru
if ($process.ExitCode -ne 0) { Fail ('No se pudo instalar la version ' + $Version + '.') ('Could not install version ' + $Version + '.') }
Remove-Item -Path $msi -Force -ErrorAction SilentlyContinue

$base = [Environment]::GetEnvironmentVariable('ProgramFiles(x86)')
if (-not $base) { $base = [Environment]::GetEnvironmentVariable('ProgramFiles') }
$dir = Join-Path $base 'ossec-agent'
$conf = Join-Path $dir 'ossec.conf'
if (-not (Test-Path $conf)) { Fail 'La instalacion no termino bien.' 'The installation did not finish correctly.' }

# A donde se conecta: solo el bloque del servidor.
$xml = Get-Content -Raw -Path $conf
$xml = [regex]::Replace($xml, '(?s)(<server>.*?<address>)[^<]*(</address>)', { param($m) $m.Groups[1].Value + $Manager + $m.Groups[2].Value })
$xml = [regex]::Replace($xml, '(?s)(<server>.*?<port>)[0-9]*(</port>)', { param($m) $m.Groups[1].Value + [string]$Port + $m.Groups[2].Value })
Set-Content -Path $conf -Value $xml -Encoding UTF8

# La clave de este servidor, que Monkey ya creo: el programa no se inscribe por su cuenta ni elige a que empresa pertenece.
Set-Content -Path (Join-Path $dir 'client.keys') -Value $line -Encoding Ascii

$reach = Test-NetConnection -ComputerName $Manager -Port $Port -WarningAction SilentlyContinue
if (-not $reach.TcpTestSucceeded) {
  Say ('AVISO: este servidor no alcanza a Monkey por el puerto ' + $Port + '. Pide a quien administre tu red que permita la conexion de SALIDA a ' + $Manager + ':' + $Port + '. No hace falta abrir puertos de entrada.') ('WARNING: this server cannot reach Monkey on port ' + $Port + '. Ask whoever manages your network to allow the OUTBOUND connection to ' + $Manager + ':' + $Port + '. No inbound ports need to be opened.')
}

$service = Get-Service -Name 'WazuhSvc'
if ($service.Status -eq 'Running') { Restart-Service -Name 'WazuhSvc' } else { Start-Service -Name 'WazuhSvc' }

Say 'Listo. En unos minutos el estado de este servidor cambiara a Conectado en Monkey.' 'Done. In a few minutes this server''s status will change to Connected in Monkey.'
`;
