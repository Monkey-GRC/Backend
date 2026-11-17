#!/usr/bin/env bash
# Prueba de punta a punta de la conexión de GCP por federación de identidad (D112) contra una API local o de desarrollo, con una cuenta
# de `admin_empresa`. Va en dos fases porque en medio el dueño del proyecto corre el script de alta en Cloud Shell.
#
#   1) Declarar el proyecto y obtener el comando para Cloud Shell:
#        PROJECT_ID=mi-proyecto MFA_CODE=123456 bash scripts/dev/smoke-gcp.sh declare
#   2) Con el número de proyecto que imprimió el script de alta: entregarlo, validar, evaluar y leer el resultado:
#        ASSET_ID=<id> PROJECT_NUMBER=<número> bash scripts/dev/smoke-gcp.sh finish
#      (CLEANUP=1 da de baja el activo al terminar.)
#
# Requisito (D112): tu backend local necesita un RUNNER_POOL propio (p. ej. local-rod) para que el trabajador del servidor de desarrollo, que comparte
# la base, no se lleve las ejecuciones; el trabajador local habla con tu backend y solo recibe las de ese grupo.
#
# Las credenciales NUNCA van en la línea de comandos: se leen de un archivo (por defecto ~/.monkey-smoke.env, permisos 600) con
#   EMAIL=...
#   PASSWORD=...
# MFA_CODE solo hace falta si no hay una sesión abierta: la sesión se guarda en ~/.cache/monkey-smoke/cookies (permisos 600) y se reutiliza.
# Nada de lo que se escribe se imprime: ni la contraseña, ni el código, ni las cookies.
set -uo pipefail
API=${API:-http://localhost:3000/v1}
CREDS=${SMOKE_ENV_FILE:-$HOME/.monkey-smoke.env}
STATE=${XDG_CACHE_HOME:-$HOME/.cache}/monkey-smoke
JAR=$STATE/cookies
mkdir -p "$STATE" && chmod 700 "$STATE" && touch "$JAR" && chmod 600 "$JAR"

pass=0; failed=0
ok()   { echo "  ✓ $*"; pass=$((pass + 1)); }
bad()  { echo "  ✗ $*"; failed=$((failed + 1)); }
die()  { bad "$*"; echo; echo "Resultado: $pass bien, $failed mal"; exit 1; }
j()    { python3 -c "import json,sys; d=json.load(sys.stdin); $1" 2>/dev/null; }
call() { curl -s -m "${TIMEOUT:-90}" -b "$JAR" -c "$JAR" -H 'Content-Type: application/json' -w '\n%{http_code}' "$@"; }
body() { sed '$d'; }
code() { tail -n1; }
err()  { body | j 'e=d.get("error") or {}; f=e.get("fields") or []; print(e.get("code"), f[0].get("code") if f else "")'; }

session() {
  echo "== Sesión"
  if [ "$(call "$API/auth/me" | code)" = 200 ]; then ok "sesión abierta reutilizada"; return; fi
  # El acceso dura 15 min; la sesión, más. Se renueva antes de pedir otra vez la contraseña y el segundo factor.
  if [ "$(call -X POST "$API/auth/refresh" | code)" = 200 ] && [ "$(call "$API/auth/me" | code)" = 200 ]; then ok "sesión renovada"; return; fi
  [ -r "$CREDS" ] || die "falta $CREDS con EMAIL y PASSWORD (chmod 600)"
  local login
  login=$(set -a; . "$CREDS"; set +a; python3 -c 'import json,os;print(json.dumps({"email":os.environ["EMAIL"],"password":os.environ["PASSWORD"]}))')
  local out; out=$(call -X POST -d "$login" "$API/auth/login"); unset login
  [ "$(echo "$out" | code)" = 200 ] || die "login ($(echo "$out" | code)): $(echo "$out" | err)"
  if [ "$(echo "$out" | body | j 'print(d["data"].get("next_step") or "")')" = mfa_verify ]; then
    [[ "${MFA_CODE:-}" =~ ^[0-9]{6}$ ]] || die "la cuenta pide el segundo factor: vuelve a correrlo con MFA_CODE=<código de 6 dígitos>"
    out=$(call -X POST -d "{\"code\":\"$MFA_CODE\"}" "$API/auth/mfa/verify")
    [ "$(echo "$out" | code)" = 200 ] || die "segundo factor ($(echo "$out" | code)): $(echo "$out" | err)"
  fi
  [ "$(call "$API/auth/me" | body | j 'print(d["data"]["user"]["role"] if "user" in d["data"] else d["data"]["role"])')" = admin_empresa ] \
    && ok "sesión de admin_empresa" || die "la cuenta no es admin_empresa"
}

declare_project() {
  : "${PROJECT_ID:?Falta PROJECT_ID (el ID del proyecto de GCP)}"
  session
  echo "== Alta del proyecto"
  local svc; svc=$(call "$API/services?page_size=1" | body | j 'print(d["data"]["items"][0]["id"])')
  [ -n "$svc" ] && ok "servicio $svc" || die "no hay ningún servicio"
  local payload; payload=$(PROJECT_ID=$PROJECT_ID SVC=$svc python3 -c 'import json,os;print(json.dumps({"name":"GCP prueba de punta a punta","connection_category":"ac_01","connection_method":"identity_federation","platform":"gcp","external_account_id":os.environ["PROJECT_ID"],"service_ids":[os.environ["SVC"]]}))')
  local out; out=$(call -X POST -d "$payload" "$API/assets")
  [ "$(echo "$out" | code)" = 201 ] || die "alta ($(echo "$out" | code)): $(echo "$out" | err)."
  local id; id=$(echo "$out" | body | j 'print(d["data"]["id"])'); ok "activo $id"
  echo "$out" | body | j 'import sys; s=d["data"]["connection_setup"]; sys.exit(0 if s["method"]=="identity_federation" and s["external_id"].startswith("mk-") and s["project_number"] is None else 1)' \
    && ok "instrucciones: canal, external_id y número pendiente" || bad "connection_setup incompleto"
  local cmd=$STATE/gcp-setup-$id.sh
  echo "$out" | body | j 'print(d["data"]["connection_setup"]["setup_command"] or "")' > "$cmd"
  [ -s "$cmd" ] && ok "comando guardado" || die "setup_command vacío: falta MONKEY_GCP_FEDERATION_ROLE_ARN en el backend"
  grep -qiE 'prowler|wazuh' "$cmd" && bad "el comando nombra al motor" || ok "el comando no nombra al motor"
  sed '1d;$d' "$cmd" | bash -n 2>/dev/null && ok "el script es bash válido" || bad "el script no es bash válido"
  echo "$out" | body | j 'print("\n".join("     · "+s for s in d["data"]["connection_setup"]["steps"]))'
  echo
  echo "Siguiente: copia el contenido de $cmd en Cloud Shell, con el proyecto $PROJECT_ID, y luego:"
  echo "  ASSET_ID=$id PROJECT_NUMBER=<el número que imprima> bash scripts/dev/smoke-gcp.sh finish"
  echo; echo "Resultado: $pass bien, $failed mal"; [ "$failed" -eq 0 ]
}

finish_project() {
  : "${ASSET_ID:?Falta ASSET_ID}" "${PROJECT_NUMBER:?Falta PROJECT_NUMBER}"
  [[ "$ASSET_ID" =~ ^[0-9a-f-]{36}$ ]] || { echo "ASSET_ID no es un uuid"; exit 2; }
  [[ "$PROJECT_NUMBER" =~ ^[0-9]{6,19}$ ]] || { echo "PROJECT_NUMBER deben ser 6 a 19 dígitos"; exit 2; }
  session
  echo "== Conexión"
  local out; out=$(call -X PATCH -d "{\"project_number\":\"$PROJECT_NUMBER\"}" "$API/assets/$ASSET_ID/connection")
  [ "$(echo "$out" | code)" = 200 ] && ok "número de proyecto entregado" || die "PATCH connection ($(echo "$out" | code)): $(echo "$out" | err)"
  out=$(TIMEOUT=120 call -X POST "$API/assets/$ASSET_ID/validate")
  case "$(echo "$out" | code)" in
    200) ok "validación real: Monkey entró al proyecto con un token temporal";;
    422) die "validación rechazada: $(echo "$out" | err)";;
    503) die "validación 503: ¿corre el trabajador local con MONKEY_GCP_FEDERATION_ROLE_ARN? ¿Tiene tu backend un RUNNER_POOL propio (D112) y el trabajador local habla con él?";;
    *)   die "validación inesperada $(echo "$out" | code): $(echo "$out" | err)";;
  esac
  echo "== Evaluación"
  out=$(call -X POST "$API/assets/$ASSET_ID/executions")
  case "$(echo "$out" | code)" in 200|201|202) ok "evaluación encolada";; *) die "evaluar ($(echo "$out" | code)): $(echo "$out" | err)";; esac
  local status="" reason="" i
  for i in $(seq 1 60); do
    out=$(call "$API/assets/$ASSET_ID/executions?page_size=1")
    status=$(echo "$out" | body | j 'print(d["data"]["items"][0]["status"])')
    reason=$(echo "$out" | body | j 'print(d["data"]["items"][0].get("failure_reason") or "")')
    case "$status" in completed|failed) break;; esac
    sleep 10
  done
  [ "$status" = completed ] && ok "evaluación completada" || die "la evaluación terminó en «$status» ${reason:+($reason)}"
  # La vista técnica (`/results?view=technical`) aún no está construida (contracts/control-tecnico.md): se lee la preparación.
  out=$(call "$API/assets/$ASSET_ID/readiness")
  [ "$(echo "$out" | code)" = 200 ] && ok "estado de preparación" || bad "estado de preparación ($(echo "$out" | code))"
  echo "$out" | body | j 'print("     "+json.dumps(d["data"], ensure_ascii=False)[:600])'
  if [ "${CLEANUP:-0}" = 1 ]; then
    [ "$(call -X DELETE "$API/assets/$ASSET_ID" | code)" = 200 ] && ok "activo dado de baja" || bad "no se pudo dar de baja el activo"
  fi
  echo; echo "Resultado: $pass bien, $failed mal"; [ "$failed" -eq 0 ]
}

case "${1:-}" in
  declare) declare_project;;
  finish)  finish_project;;
  *) echo "Uso: $0 declare | finish   (ver el encabezado)"; exit 2;;
esac
