#!/usr/bin/env bash
set -euo pipefail

COMFYUI_PATH="${COMFYUI_PATH:-$HOME/Documents/ComfyUI-Server}"
LORA_DIR="$COMFYUI_PATH/models/loras"
LORA_FILE="$LORA_DIR/lcm_lora_sdxl.safetensors"
EXPECTED_SHA="a764e6859b6e04047cd761c08ff0cee96413a8e004c9f07707530cd776b19141"
URL="https://huggingface.co/latent-consistency/lcm-lora-sdxl/resolve/main/pytorch_lora_weights.safetensors?download=true"

mkdir -p "$LORA_DIR"

verify() {
  local actual
  actual="$(shasum -a 256 "$LORA_FILE" | awk '{print $1}')"
  [[ "$actual" == "$EXPECTED_SHA" ]]
}

if [[ -f "$LORA_FILE" ]] && verify; then
  echo "LCM-LoRA already installed and verified: $LORA_FILE"
  exit 0
fi

rm -f "$LORA_FILE.tmp"
echo "Downloading official SDXL LCM-LoRA benchmark adapter..."
curl --fail --location --retry 3 --retry-delay 2 --output "$LORA_FILE.tmp" "$URL"
mv "$LORA_FILE.tmp" "$LORA_FILE"

if ! verify; then
  echo "LCM-LoRA SHA256 verification failed." >&2
  rm -f "$LORA_FILE"
  exit 1
fi

echo "LCM-LoRA installed and SHA256 verified: $LORA_FILE"
