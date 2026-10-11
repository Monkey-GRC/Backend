#!/usr/bin/env bash
# Prueba de humo del flujo de conexión de punta a punta contra una API (local o de desarrollo), con una cuenta de `admin_empresa`.
# Crea una conexión de prueba, la comprueba, elige activos, lee la preparación y la da de baja al terminar (la baja borra las llaves guardadas).
#
# Uso:
#   API=https://api-dev.monkey360.io/v1 EMAIL=... PASSWORD=... bash scripts/dev/smoke-connection.sh
#   API=http://localhost:3000/v1 EMAIL=... PASSWORD=... AWS_ACCOUNT=106948907720 AWS_KEY=AKIA... AWS_SECRET=... bash scripts/dev/smoke-connection.sh
# Sin AWS_KEY/AWS_SECRET prueba el canal de ROL (el alta, las instrucciones y el fallo limpio al no existir el rol). Con ellos prueba el canal de LLAVES de verdad:
# comprobación, descubrimiento de activos, selección y preparación. Nada de lo que escribe se imprime: ni la contraseña ni las llaves.
set -uo pipefail
: "${API:?Falta API (p. ej. http://localhost:3000/v1)}" "${EMAIL:?Falta EMAIL}" "${PASSWORD:?Falta PASSWORD}"
REGION=${AWS_REGION_TEST:-us-east-2}
JAR=$(mktemp); trap 'rm -f "$JAR"' EXIT
pass=0; failed=0
ok()   { echo "  ✓ $*"; pass=$((pass + 1)); }
bad()  { echo "  ✗ $*"; failed=$((failed + 1)); }
j()    { python3 -c "import json,sys; d=json.load(sys.stdin); $1" 2>/dev/null; }
call() { curl -s -m "${TIMEOUT:-90}" -b "$JAR" -c "$JAR" -H 'Content-Type: application/json' -w '\n%{http_code}' "$@"; }
body() { sed '$d'; }
code() { tail -n1; }

echo "== Sesión"
out=$(curl -s -m 30 -c "$JAR" -H 'Content-Type: application/json' -d "$(python3 -c 'import json,os;print(json.dumps({"email":os.environ["EMAIL"],"password":os.environ["PASSWORD"]}))')" -w '\n%{http_code}' "$API/auth/login")
[ "$(echo "$out" | code)" = 200 ] && ok "login" || { bad "login ($(echo "$out" | code)): $(echo "$out" | body | j 'print(d.get("error",{}).get("code"))')"; exit 1; }
ROLE=$(echo "$out" | body | j 'print(d["data"]["user"]["role"])'); [ "$ROLE" = admin_empresa ] && ok "rol admin_empresa" || { bad "la cuenta es $ROLE: hace falta un admin_empresa"; exit 1; }

echo "== Servicio y catálogos"
SVC=$(call "$API/services?page_size=1" | body | j 'print(d["data"]["items"][0]["id"])')
[ -n "$SVC" ] && ok "servicio $SVC" || { bad "no hay ningún servicio"; exit 1; }
for c in resource_kind aws_region connection_method; do [ "$(call "$API/catalogs/$c" | code)" = 200 ] && ok "catálogo $c" || bad "catálogo $c"; done
SCEN=$(call "$API/services/$SVC/technical-control" | body | j 'print(d["data"]["deployment_scenario"])')
[ "$SCEN" != None ] && ok "escenario: $SCEN" || bad "el servicio no tiene escenario: defínelo en la pantalla"

echo "== Conexión de prueba"
if [ -n "${AWS_KEY:-}" ]; then METHOD=access_keys; else METHOD=readonly_role; fi
ACC=${AWS_ACCOUNT:-123456789012}
PAYLOAD=$(METHOD=$METHOD ACC=$ACC SVC=$SVC REGION=$REGION python3 - <<'PY'
import json,os
p={"name":"Prueba de humo","connection_category":"ac_01","connection_method":os.environ["METHOD"],"platform":"aws","external_account_id":os.environ["ACC"],"regions":[os.environ["REGION"]],"service_ids":[os.environ["SVC"]]}
if os.environ["METHOD"]=="access_keys": p["credentials"]={"access_key_id":os.environ.get("AWS_KEY",""),"secret_access_key":os.environ.get("AWS_SECRET","")}
print(json.dumps(p))
PY
)
out=$(call -X POST -d "$PAYLOAD" "$API/assets"); [ "$(echo "$out" | code)" = 201 ] && ok "alta por $METHOD" || { bad "alta ($(echo "$out" | code)): $(echo "$out" | body | cut -c1-200)"; exit 1; }
ID=$(echo "$out" | body | j 'print(d["data"]["id"])'); echo "$out" | body | grep -qiE 'secret|AKIA' && bad "la respuesta del alta trae llaves" || ok "la respuesta no trae llaves"
cleanup() { [ "$(call -X DELETE "$API/assets/$ID" | code)" = 200 ] && echo "== Limpieza: conexión de prueba dada de baja" || echo "== ¡Limpieza fallida! Quita la conexión «Prueba de humo» a mano"; }
if [ "$METHOD" = readonly_role ]; then
  echo "$out" | body | j 'import sys; s=d["data"]["connection_setup"]; sys.exit(0 if s.get("external_id","").startswith("mk-") and s.get("template_path") else 1)' && ok "instrucciones: ExternalId y plantilla" || bad "faltan las instrucciones del rol"
  echo "$out" | body | j 'import sys; sys.exit(0 if d["data"]["connection_setup"].get("monkey_principal_arn") else 1)' && ok "identidad de Monkey presente" || bad "FALTA MONKEY_AWS_PRINCIPAL_ARN en el servidor"
  [ "$(call "$API/connection-templates/aws-readonly-role" | code)" = 200 ] && ok "plantilla descargable" || bad "plantilla"
  call -X PATCH -d "{\"role_arn\":\"arn:aws:iam::$ACC:role/MonkeyReadOnly\"}" "$API/assets/$ID/connection" >/dev/null
  out=$(call -X POST "$API/assets/$ID/validate"); c=$(echo "$out" | code)
  case "$c" in 200) ok "validación real (el rol existe y confía en Monkey)";; 422) ok "validación: fallo limpio -> $(echo "$out" | body | j 'print(d["error"]["fields"][0]["code"])')";; 503) bad "validación 503: el trabajador no atiende (PROBE_MODE/trabajador)";; *) bad "validación inesperada $c";; esac
else
  out=$(call -X POST "$API/assets/$ID/validate"); [ "$(echo "$out" | code)" = 200 ] && ok "validación real" || { bad "validación ($(echo "$out" | code)): $(echo "$out" | body | cut -c1-200)"; cleanup; exit 1; }
  echo "$out" | body | j 'import sys; sys.exit(0 if d["data"]["probe_mode"]=="runner" else 1)' && ok "probe_mode runner (no simulado)" || bad "la comprobación NO es real"
  res=$(call "$API/assets/$ID/resources?service_id=$SVC&page_size=100" | body)
  N=$(echo "$res" | j 'print(d["data"]["total"])'); [ "${N:-0}" -gt 0 ] && ok "$N activos descubiertos" || bad "no se descubrió ningún activo"
  echo "$res" | j 'import sys; it=d["data"]["items"]; sys.exit(0 if all(i["code"].startswith("AST-") for i in it) and any(i.get("ip_address") or i.get("location") for i in it) else 1)' && ok "con código, IP/zona" || bad "activos sin identificar"
  IDS=$(echo "$res" | j 'print(",".join("\"%s\""%i["id"] for i in d["data"]["items"][:2]))')
  out=$(call -X PUT -d "{\"asset_ids\":[$IDS]}" "$API/services/$SVC/connections/$ID/assets"); [ "$(echo "$out" | code)" = 200 ] && ok "selección: $(echo "$out" | body | j 'print(d["data"])')" || bad "selección ($(echo "$out" | code))"
  [ "$(call "$API/assets/$ID/readiness?service_id=$SVC" | code)" = 200 ] && ok "preparación por servicio" || bad "preparación por servicio"
  [ "$(call -X PUT -d '{"asset_ids":["6f1c2a3b-4d5e-4f60-8a9b-0c1d2e3f4a5b"]}' "$API/services/$SVC/connections/$ID/assets" | code)" = 422 ] && ok "un id ajeno se rechaza (422)" || bad "un id ajeno NO se rechazó"
fi
cleanup
[ "$(call "$API/assets/$ID" | code)" = 404 ] && ok "la conexión dada de baja ya no existe (404)" || bad "la baja no ocultó la conexión"
[ "$(call -X POST "$API/assets/$ID/validate" | code)" = 404 ] && ok "no se puede operar una conexión dada de baja" || bad "una conexión dada de baja se pudo validar"
echo; echo "Resultado: $pass bien, $failed mal"; [ "$failed" -eq 0 ]
