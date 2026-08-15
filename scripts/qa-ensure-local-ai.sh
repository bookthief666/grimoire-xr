#!/usr/bin/env bash
set -euo pipefail

mkdir -p automation-logs

OLLAMA_URL="${OLLAMA_BASE_URL:-http://127.0.0.1:11434}"
COMFY_URL="${COMFYUI_BASE_URL:-http://127.0.0.1:8188}"
COMFY_ROOT="${COMFYUI_ROOT:-$HOME/Documents/ComfyUI-Server}"
COMFY_PYTHON="${COMFYUI_PYTHON:-$HOME/Documents/ComfyUI/.venv/bin/python}"

wait_for_url() {
  local url="$1"
  local label="$2"
  local attempts="${3:-90}"
  local delay="${4:-2}"
  for ((i=1; i<=attempts; i++)); do
    if curl --fail --silent --show-error "$url" >/dev/null 2>&1; then
      echo "$label is ready."
      return 0
    fi
    sleep "$delay"
  done
  echo "$label did not become ready at $url" >&2
  return 1
}

if curl --fail --silent --show-error "$OLLAMA_URL/api/tags" >/dev/null 2>&1; then
  echo "Ollama already available at $OLLAMA_URL"
else
  OLLAMA_BIN="$(command -v ollama || true)"
  if [[ -z "$OLLAMA_BIN" && -x /opt/homebrew/bin/ollama ]]; then
    OLLAMA_BIN=/opt/homebrew/bin/ollama
  fi
  if [[ -z "$OLLAMA_BIN" && -x /usr/local/bin/ollama ]]; then
    OLLAMA_BIN=/usr/local/bin/ollama
  fi
  if [[ -z "$OLLAMA_BIN" ]]; then
    echo "Ollama is not running and no ollama binary was found." >&2
    exit 1
  fi
  echo "Starting Ollama with $OLLAMA_BIN"
  nohup "$OLLAMA_BIN" serve > automation-logs/ollama.log 2>&1 &
  echo $! > automation-logs/ollama.pid
  if ! wait_for_url "$OLLAMA_URL/api/tags" "Ollama" 60 2; then
    tail -100 automation-logs/ollama.log >&2 || true
    exit 1
  fi
fi

if curl --fail --silent --show-error "$COMFY_URL/system_stats" >/dev/null 2>&1; then
  echo "ComfyUI already available at $COMFY_URL"
else
  if [[ ! -x "$COMFY_PYTHON" ]]; then
    echo "ComfyUI Python is not executable: $COMFY_PYTHON" >&2
    exit 1
  fi
  if [[ ! -f "$COMFY_ROOT/main.py" ]]; then
    echo "ComfyUI main.py was not found: $COMFY_ROOT/main.py" >&2
    exit 1
  fi
  COMFY_PORT="${COMFYUI_PORT:-8188}"
  echo "Starting ComfyUI from $COMFY_ROOT on port $COMFY_PORT"
  (
    cd "$COMFY_ROOT"
    nohup "$COMFY_PYTHON" main.py --listen 127.0.0.1 --port "$COMFY_PORT" > "$GITHUB_WORKSPACE/automation-logs/comfyui.log" 2>&1 &
    echo $! > "$GITHUB_WORKSPACE/automation-logs/comfyui.pid"
  )
  if ! wait_for_url "$COMFY_URL/system_stats" "ComfyUI" 120 2; then
    tail -150 automation-logs/comfyui.log >&2 || true
    exit 1
  fi
fi

curl --fail --silent --show-error "$OLLAMA_URL/api/tags" > automation-logs/ollama-tags.json
curl --fail --silent --show-error "$COMFY_URL/system_stats" > automation-logs/comfy-system-stats.json

echo "Local AI service preflight passed."
