#!/usr/bin/env bash
set -euo pipefail

API_URL="${GRIMOIRE_QA_API_URL:-http://127.0.0.1:8788}"
OUT_ROOT="${GRIMOIRE_FOLD_QA_DIR:-qa-output/fold-smoke}"
APP_ID="com.grimoire.app"
APK_PATH="android/app/build/outputs/apk/debug/app-debug.apk"
mkdir -p "$OUT_ROOT"

for command in adb cloudflared curl npm; do
  command -v "$command" >/dev/null 2>&1 || { echo "Missing required command: $command" >&2; exit 1; }
done

SERIAL="${ANDROID_SERIAL:-$(adb devices | awk 'NR > 1 && $2 == "device" { print $1; exit }')}"
if [[ -z "$SERIAL" ]]; then
  echo 'No authorized Android device is connected; Fold smoke QA skipped.'
  exit 2
fi

MODEL="$(adb -s "$SERIAL" shell getprop ro.product.model | tr -d '\r')"
echo "Android device: $MODEL ($SERIAL)"

TUNNEL_LOG="$OUT_ROOT/cloudflared.log"
cloudflared tunnel --edge-ip-version 4 --protocol http2 --url "$API_URL" >"$TUNNEL_LOG" 2>&1 &
TUNNEL_PID=$!
cleanup() {
  kill "$TUNNEL_PID" 2>/dev/null || true
}
trap cleanup EXIT

TUNNEL_URL=''
for attempt in {1..60}; do
  TUNNEL_URL="$(grep -Eo 'https://[a-z0-9-]+\.trycloudflare\.com' "$TUNNEL_LOG" | tail -1 || true)"
  [[ -n "$TUNNEL_URL" ]] && break
  sleep 1
done
if [[ -z "$TUNNEL_URL" ]]; then
  echo 'Cloudflare Quick Tunnel URL was not discovered.' >&2
  cat "$TUNNEL_LOG" >&2 || true
  exit 1
fi

echo "Temporary device API: $TUNNEL_URL"
curl --fail --silent --show-error "$TUNNEL_URL/health" > "$OUT_ROOT/tunnel-health.json"

VITE_GRIMOIRE_API_URL="$TUNNEL_URL" npm run mobile:sync
(
  cd android
  ./gradlew assembleDebug
)

[[ -f "$APK_PATH" ]] || { echo "Debug APK not found at $APK_PATH" >&2; exit 1; }
adb -s "$SERIAL" install -r "$APK_PATH" > "$OUT_ROOT/install.txt"
adb -s "$SERIAL" logcat -c || true
adb -s "$SERIAL" shell am force-stop "$APP_ID" || true
adb -s "$SERIAL" shell am start -n "$APP_ID/.MainActivity" > "$OUT_ROOT/launch.txt"
sleep 10

PID="$(adb -s "$SERIAL" shell pidof "$APP_ID" | tr -d '\r' || true)"
if [[ -z "$PID" ]]; then
  adb -s "$SERIAL" logcat -d -v threadtime > "$OUT_ROOT/logcat.txt" || true
  echo 'Grimoire process is not running after launch.' >&2
  exit 1
fi

echo "$PID" > "$OUT_ROOT/pid.txt"
adb -s "$SERIAL" exec-out screencap -p > "$OUT_ROOT/launch.png"
adb -s "$SERIAL" logcat -d -v threadtime > "$OUT_ROOT/logcat.txt" || true
adb -s "$SERIAL" shell dumpsys package "$APP_ID" > "$OUT_ROOT/package.txt" || true
adb -s "$SERIAL" shell uiautomator dump /sdcard/grimoire-window.xml >/dev/null 2>&1 || true
adb -s "$SERIAL" pull /sdcard/grimoire-window.xml "$OUT_ROOT/window.xml" >/dev/null 2>&1 || true

cat > "$OUT_ROOT/summary.json" <<EOF
{
  "device": "${MODEL//\"/\\\"}",
  "serial": "${SERIAL//\"/\\\"}",
  "appId": "$APP_ID",
  "pid": "$PID",
  "apiUrl": "$TUNNEL_URL",
  "status": "passed"
}
EOF

echo "Fold smoke QA passed. Evidence: $OUT_ROOT"
