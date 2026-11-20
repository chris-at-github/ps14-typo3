#!/usr/bin/env bash
#
# Creates a new customer project from this template (clone, configure,
# install, build, data, setup, MCP, verify). Not interactive: all values are
# passed as options. Output is one line per step, details go to
# <dir>/temp/create-system.log.
#
# Usage:
#   bin/create-system.sh --dir <path> --name <ddev-name> --branch <branch> \
#       --title <website-title> --live-url <https://…/> \
#       [--staging-url <https://…/>] [--mcp-user <uid>] [--from <step>]

set -euo pipefail

readonly STEPS=(clone configure start install build data setup mcp verify)
readonly TEMPLATE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
readonly OLD_HOST_PATTERN='ps14-typo3\.ddev\.site|vite\.ps14-typo3|dev\.ps14\.de'
readonly HOST_FILES=(
    .ddev/config.yaml
    .ddev/config.vite.yaml
    .ddev/apache/vite.conf
    .ddev/nginx_full/vite.conf
    README.md
    config/sites/ps14/config.yaml
)

DIR=''
NAME=''
BRANCH=''
TITLE=''
LIVE_URL=''
STAGING_URL=''
MCP_USER='1'
FROM='clone'
LOG=''

usage() {
    sed -n '2,12p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'
    exit "${1:-0}"
}

fail() {
    echo "FEHLER: $*" >&2
    exit 1
}

# --- Options ---------------------------------------------------------------

while [[ $# -gt 0 ]]; do
    case "$1" in
        --dir) DIR="${2:-}"; shift 2 ;;
        --name) NAME="${2:-}"; shift 2 ;;
        --branch) BRANCH="${2:-}"; shift 2 ;;
        --title) TITLE="${2:-}"; shift 2 ;;
        --live-url) LIVE_URL="${2:-}"; shift 2 ;;
        --staging-url) STAGING_URL="${2:-}"; shift 2 ;;
        --mcp-user) MCP_USER="${2:-}"; shift 2 ;;
        --from) FROM="${2:-}"; shift 2 ;;
        -h|--help) usage 0 ;;
        *) echo "Unbekannte Option: $1" >&2; usage 1 ;;
    esac
done

[[ -n "$DIR" && -n "$NAME" && -n "$BRANCH" && -n "$TITLE" && -n "$LIVE_URL" ]] \
    || fail 'Pflichtoptionen: --dir, --name, --branch, --title, --live-url'
[[ "$NAME" =~ ^[a-z0-9-]+$ ]] || fail '--name erlaubt nur [a-z0-9-]'
[[ "$BRANCH" =~ ^[a-z0-9-]+$ ]] || fail '--branch erlaubt nur [a-z0-9-]'
[[ "$LIVE_URL" =~ ^https://[^/]+/$ ]] || fail '--live-url muss https://<host>/ sein'
[[ -z "$STAGING_URL" || "$STAGING_URL" =~ ^https://[^/]+/$ ]] \
    || fail '--staging-url muss https://<host>/ sein'
[[ "$MCP_USER" =~ ^[0-9]+$ ]] || fail '--mcp-user muss eine Uid sein'

FROM_INDEX=-1
for i in "${!STEPS[@]}"; do
    [[ "${STEPS[$i]}" == "$FROM" ]] && FROM_INDEX=$i
done
[[ $FROM_INDEX -ge 0 ]] || fail "--from muss einer dieser Schritte sein: ${STEPS[*]}"

DIR="$(realpath -m "$DIR")"
[[ "$DIR" != "$TEMPLATE_DIR" ]] || fail '--dir darf nicht die Vorlage sein'

readonly TEMPLATE_NAME="$(sed -n 's/^name: *//p' "$TEMPLATE_DIR/.ddev/config.yaml")"
readonly DEV_URL="https://$NAME.ddev.site/"

# --- Helpers ---------------------------------------------------------------

# Escapes a string for the replacement part of a sed s|…|…| expression.
sed_escape() {
    printf '%s' "$1" | sed -e 's/[\\|&]/\\&/g'
}

is_running() {
    ddev describe "$1" -j 2>/dev/null | grep -q '"status":"running"'
}

run_step() {
    local step="$1"
    printf '==> %-10s ' "$step"
    echo "===== $step ($(date '+%F %T')) =====" >>"$LOG"
    # errexit is ignored inside an if condition, so run the step on its own.
    local rc=0
    set +e
    ( set -euo pipefail; "step_$step" ) >>"$LOG" 2>&1
    rc=$?
    set -e
    if [[ $rc -eq 0 ]]; then
        echo 'OK'
    else
        echo 'FEHLER'
        echo "--- letzte Zeilen aus $LOG ---" >&2
        tail -n 20 "$LOG" >&2
        # Before the clone, the log is a temporary file outside the project.
        [[ "$LOG" == "$DIR/"* ]] || rm -f "$LOG"
        echo "Fortsetzen mit: $0 … --from $step" >&2
        exit 1
    fi
}

# --- Steps -----------------------------------------------------------------

step_clone() {
    [[ ! -e "$DIR" ]] || { echo "Verzeichnis existiert bereits: $DIR"; return 1; }
    # ddev list also knows projects whose directory no longer exists.
    if ddev list -j 2>/dev/null | jq -e --arg name "$NAME" '.raw[] | select(.name == $name)' >/dev/null; then
        echo "DDEV-Projekt existiert bereits: $NAME"
        return 1
    fi

    local origin
    origin="$(git -C "$TEMPLATE_DIR" remote get-url origin)"
    git clone --branch main "$TEMPLATE_DIR" "$DIR"
    git -C "$DIR" remote set-url origin "$origin"
    git -C "$DIR" switch -c "$BRANCH"
    mkdir -p "$DIR/temp"
}

step_configure() {
    cd "$DIR"
    local name_e title_yaml title_php key
    name_e="$(sed_escape "$NAME")"

    # DDEV name and hostnames
    sed -i "s|^name: .*|name: $name_e|" .ddev/config.yaml
    sed -i -e "s|vite\.$TEMPLATE_NAME|vite.$name_e|g" \
        .ddev/config.vite.yaml .ddev/apache/vite.conf .ddev/nginx_full/vite.conf README.md
    sed -i -e "s|$TEMPLATE_NAME\.ddev\.site|$name_e.ddev.site|g" README.md

    # Site configuration: title, base variants, robots.txt sitemaps
    title_yaml="$(sed_escape "${TITLE//\'/\'\'}")"
    sed -i "s|^websiteTitle: .*|websiteTitle: '$title_yaml'|" config/sites/ps14/config.yaml

    local variants
    variants="  -\n    base: '$DEV_URL'\n    condition: 'applicationContext == \"Development\"'\n"
    if [[ -n "$STAGING_URL" ]]; then
        variants+="  -\n    base: '$STAGING_URL'\n    condition: 'applicationContext == \"Production/Staging\"'\n"
    fi
    variants+="  -\n    base: '$LIVE_URL'\n    condition: 'applicationContext == \"Production\"'\n"
    awk -v variants="$variants" '
        /^baseVariants:/ { print; printf "%s", variants; skip = 1; next }
        skip && /^[^ -]/ { skip = 0 }
        !skip { print }
    ' config/sites/ps14/config.yaml >config/sites/ps14/config.yaml.new
    mv config/sites/ps14/config.yaml.new config/sites/ps14/config.yaml

    sed -i -E "s|(Sitemap: )https://[^/]+/|\1$(sed_escape "$LIVE_URL")|" config/sites/ps14/config.yaml

    # Local settings incl. MCP server; copied before "ddev start", which only
    # generates additional.php if it is missing or still marked as generated.
    cp config/system/additional.ddev.php config/system/additional.php

    # System settings: new encryption key and site name. A PHP string may
    # contain escaped quotes, so configure can be run more than once.
    local php_string="'[^'\\\\]*(\\\\.[^'\\\\]*)*'"
    key="$(openssl rand -hex 48)"
    title_php="$(sed_escape "$(printf '%s' "$TITLE" | sed -e "s/[\\\\']/\\\\&/g")")"
    sed -i -E \
        -e "s|('encryptionKey' => )$php_string|\\1'$key'|" \
        -e "s|('sitename' => )$php_string|\\1'$title_php'|" \
        config/system/settings.php
}

step_start() {
    cd "$DIR"
    ddev start
}

step_install() {
    cd "$DIR"
    ddev composer install --no-interaction
    ddev npm ci
}

step_build() {
    cd "$DIR"
    ddev exec node build/build-iconfont.js
    ddev vite build
}

step_data() {
    if ! is_running "$TEMPLATE_NAME"; then
        echo "Die Vorlage ($TEMPLATE_NAME) läuft nicht: cd $TEMPLATE_DIR && ddev start"
        return 1
    fi

    local dump="$DIR/sql/template-$(date '+%y%m%d').sql.gz"
    (cd "$TEMPLATE_DIR" && ddev export-db --file="$dump")

    cd "$DIR"
    ddev import-db --file="$dump"
    if [[ -f sql/post-import.sql ]] && grep -qvE '^[[:space:]]*(--.*)?$' sql/post-import.sql; then
        ddev mysql <sql/post-import.sql
    else
        echo 'sql/post-import.sql enthält keine Anweisungen, übersprungen'
    fi

    mkdir -p public/fileadmin
    rsync -a "$TEMPLATE_DIR/public/fileadmin/" public/fileadmin/
    ln -sfn htaccess/.htaccess-ddev public/.htaccess
}

step_setup() {
    cd "$DIR"
    ddev typo3 extension:setup
    ddev typo3 upgrade:list
    ddev typo3 cache:flush
}

step_mcp() {
    cd "$DIR"
    local output key
    # The key is neither printed nor logged.
    output="$(ddev typo3 in2mcp:apikey "$MCP_USER" 2>/dev/null)" \
        || { echo "in2mcp:apikey für Benutzer $MCP_USER fehlgeschlagen"; return 1; }
    key="$(printf '%s\n' "$output" | tr -d '\r' | grep -E '^[0-9]+\.[A-Za-z0-9_-]+$' | head -n 1 || true)"
    [[ -n "$key" ]] || { echo 'Kein API-Key in der Ausgabe gefunden'; return 1; }

    claude mcp remove in2mcp --scope local >/dev/null 2>&1 || true
    # Errors are not logged either, as they could contain the key.
    claude mcp add --transport http in2mcp "${DEV_URL}typo3/mcp" \
        --header "Api-Key: $key" --scope local >/dev/null 2>&1 \
        || { echo 'claude mcp add fehlgeschlagen'; return 1; }
    echo "in2mcp registriert: ${DEV_URL}typo3/mcp (Benutzer $MCP_USER)"
}

step_verify() {
    cd "$DIR"
    local errors=0 path status

    for path in de/ en/ typo3/; do
        status="$(curl -skL -o /dev/null -w '%{http_code}' "$DEV_URL$path")"
        echo "$DEV_URL$path → $status"
        [[ "$status" == '200' ]] || errors=$((errors + 1))
    done

    if [[ -z "$(ls -A public/_assets/vite 2>/dev/null)" ]]; then
        echo 'public/_assets/vite/ ist leer'
        errors=$((errors + 1))
    fi

    if grep -nE "$OLD_HOST_PATTERN" "${HOST_FILES[@]}"; then
        echo 'Alte Hostnamen gefunden (siehe oben)'
        errors=$((errors + 1))
    fi

    [[ $errors -eq 0 ]]
}

# --- Main ------------------------------------------------------------------

if [[ $FROM_INDEX -eq 0 ]]; then
    LOG="$(mktemp)"
else
    [[ -d "$DIR/.git" ]] || fail "Projekt fehlt: $DIR (mit --from clone beginnen)"
    mkdir -p "$DIR/temp"
    LOG="$DIR/temp/create-system.log"
fi

for i in "${!STEPS[@]}"; do
    [[ $i -lt $FROM_INDEX ]] && continue
    run_step "${STEPS[$i]}"
    if [[ "${STEPS[$i]}" == 'clone' ]]; then
        cat "$LOG" >>"$DIR/temp/create-system.log"
        rm -f "$LOG"
        LOG="$DIR/temp/create-system.log"
    fi
done

echo
echo "Fertig: $DEV_URL (Backend: ${DEV_URL}typo3/)"
echo "Log: $LOG"
