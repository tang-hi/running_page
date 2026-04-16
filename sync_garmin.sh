#!/bin/bash
set -e

# Load .env if exists
if [ -f .env ]; then
    set -a
    source .env
    set +a
fi

# Disable logfire auto-instrumentation from openai dependency
export LOGFIRE_SEND_TO_LOGFIRE=false

if [ -z "$GARMIN_EMAIL" ] || [ -z "$GARMIN_PASSWORD" ]; then
    echo "Set GARMIN_EMAIL and GARMIN_PASSWORD in .env or environment"
    exit 1
fi

# Use venv python
VENV_PYTHON="$(dirname "$0")/venv/bin/python"
if [ ! -f "$VENV_PYTHON" ]; then
    echo "venv not found at $VENV_PYTHON, please run: python3 -m venv venv && venv/bin/pip install -r requirements.txt"
    exit 1
fi

# Auto-detect: use xvfb-run on headless servers (no DISPLAY)
PYTHON="$VENV_PYTHON"
if [ -z "$DISPLAY" ] && command -v xvfb-run &>/dev/null; then
    PYTHON="xvfb-run $VENV_PYTHON"
    echo "Headless server detected, using xvfb-run"
fi

# Config (same as workflow)
ATHLETE="tang-hi"
TITLE="TangDH Running"
MIN_GRID_DISTANCE=3
TITLE_GRID="Over 3km Runs"
BIRTHDAY_MONTH="1996-10"

# 1. Sync garmin data
echo "=== Syncing Garmin data ==="
$PYTHON run_page/garmin_sync.py

# 2. Generate SVGs
echo "=== Generating SVGs ==="
"$VENV_PYTHON" run_page/gen_svg.py --from-db --title "$TITLE" --type github --github-style "align-firstday" --athlete "$ATHLETE" --special-distance 10 --special-distance2 20 --special-color yellow --special-color2 red --output assets/github.svg --use-localtime --min-distance 0.5
"$VENV_PYTHON" run_page/gen_svg.py --from-db --title "$TITLE_GRID" --type grid --athlete "$ATHLETE" --output assets/grid.svg --special-color yellow --special-color2 red --special-distance 20 --special-distance2 40 --use-localtime --min-distance "$MIN_GRID_DISTANCE"
"$VENV_PYTHON" run_page/gen_svg.py --from-db --type circular --use-localtime
"$VENV_PYTHON" run_page/gen_svg.py --from-db --year "$(date +%Y)" --language zh_CN --title "$(date +%Y) Running" --type github --github-style "align-firstday" --athlete "$ATHLETE" --special-distance 10 --special-distance2 20 --special-color yellow --special-color2 red --output "assets/github_$(date +%Y).svg" --use-localtime --min-distance 0.5

# 3. Generate month of life SVGs
echo "=== Generating Month of Life ==="
for type_title in "running:Runner" "walking:Walker" "hiking:Hiker" "cycling:Cyclist" "all:" "swimming:Swimmer" "skiing:Skier"; do
    sport="${type_title%%:*}"
    label="${type_title##*:}"
    output="assets/mol_${sport}.svg"
    title="${label:+${label} }Month of Life"
    [ "$sport" = "all" ] && output="assets/mol.svg"
    "$VENV_PYTHON" run_page/gen_svg.py --from-db --type monthoflife --birth "$BIRTHDAY_MONTH" \
        --special-color "#f9d367" --special-color2 "#f0a1a8" \
        --output "$output" --use-localtime --athlete "$ATHLETE" --title "$title" --sport-type "$sport"
done

# 4. Format and lint generated files to keep CI green
echo "=== Formatting and linting ==="
if command -v corepack >/dev/null 2>&1; then
    corepack pnpm run format || echo 'format failed, continuing'
    corepack pnpm run lint || echo 'lint failed, continuing'
else
    echo 'corepack not found, skipping pnpm format/lint'
fi

# 5. Commit and push
echo "=== Committing and pushing ==="
git add .
git commit -m 'update new runs' || echo 'nothing to commit'
git push || echo 'nothing to push'

echo "=== Done ==="
