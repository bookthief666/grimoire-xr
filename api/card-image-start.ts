/// <reference types="node" />
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  DEFAULT_TAROT_SYSTEM,
  TAROT_SYSTEM_IDS,
  getTarotSystem,
  type TarotSystemId,
} from '../src/constants/tarotSystems.js'
import {
  DEFAULT_EROS_LEVEL,
  EROS_LEVEL_IDS,
  getErosLevel,
  type ErosLevelId,
} from '../src/constants/erosLevels.js'
import {
  DEFAULT_ART_STYLE,
  ART_STYLE_IDS,
  getArtStyle,
  type ArtStyleId,
} from '../src/constants/artStyles.js'

type NodeApiRequest = {
  method?: string
  body?: unknown
}

type NodeApiResponse = {
  setHeader?: (name: string, value: string) => void
  status: (statusCode: number) => NodeApiResponse
  json: (body: unknown) => void
}

type QualityMode = 'preview' | 'final'

const QUALITY_PRESETS: Record<QualityMode, { width: number; height: number; steps: number; cfg: number }> = {
  preview: { width: 512, height: 768, steps: 16, cfg: 6 },
  final: { width: 768, height: 1152, steps: 24, cfg: 6.5 },
}

function readString(value: unknown, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

function readEnum<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  const text = readString(value)
  return allowed.includes(text as T) ? (text as T) : fallback
}

function readTarotSystem(body: Record<string, unknown>): TarotSystemId {
  return readEnum(body.tarotSystem, TAROT_SYSTEM_IDS, DEFAULT_TAROT_SYSTEM)
}

function readErosLevel(body: Record<string, unknown>): ErosLevelId {
  return readEnum(body.erosLevel, EROS_LEVEL_IDS, DEFAULT_EROS_LEVEL)
}

function readArtStyle(body: Record<string, unknown>): ArtStyleId {
  return readEnum(body.artStyle, ART_STYLE_IDS, DEFAULT_ART_STYLE)
}

function readQualityMode(body: Record<string, unknown>): QualityMode {
  return body.qualityMode === 'preview' ? 'preview' : 'final'
}

function readSeed(body: Record<string, unknown>) {
  const value = body.seed

  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.max(0, Math.min(2147483647, Math.floor(value)))
  }

  return Math.floor(Math.random() * 2147483647)
}

function buildPositivePrompt(body: Record<string, unknown>) {
  const tarotSystemProfile = getTarotSystem(readTarotSystem(body))
  const erosLevelProfile = getErosLevel(readErosLevel(body))
  const artStyleProfile = getArtStyle(readArtStyle(body))

  return [
    'masterpiece, best quality, highly detailed occult tarot illustration',
    'vertical tarot-card-safe composition, central symbolic figure or ritual tableau',
    'hermetic, alchemical, sacred geometry, cinematic lighting, polished fantasy realism',
    'no text, no watermark, no logo',
    readString(body.cardName),
    readString(body.sigil) ? `sigil motif: ${readString(body.sigil)}` : '',
    readString(body.artPrompt),
    `tarot system visual grammar: ${tarotSystemProfile.label}; ${tarotSystemProfile.description}`,
    `tarot system instruction: ${tarotSystemProfile.instruction}`,
    `art style discipline: ${artStyleProfile.label}; ${artStyleProfile.prompt}`,
    `eros intensity: ${erosLevelProfile.shortLabel}; ${erosLevelProfile.imagePrompt}`,
    readString(body.visualStyle) ? `legacy visual atmosphere hint: ${readString(body.visualStyle)}` : '',
    readString(body.erosField) ? `legacy eros field hint: ${readString(body.erosField)}` : '',
    'symbolically coherent, devotional, psychologically serious, initiatory composition',
  ].filter(Boolean).join(', ')
}

function buildNegativePrompt(body: Record<string, unknown>) {
  const artStyleProfile = getArtStyle(readArtStyle(body))

  return [
    'text, letters, words, watermark, signature, logo',
    'blurry, low quality, low resolution, bad anatomy, extra fingers, extra limbs',
    'cropped, duplicate, ugly, distorted, malformed face, broken hands',
    artStyleProfile.negative,
  ].filter(Boolean).join(', ')
}

function chooseCheckpoint(body: Record<string, unknown>) {
  const erosLevel = readErosLevel(body)
  const useErosCheckpoint =
    erosLevel === 'charged' ||
    erosLevel === 'ecstatic' ||
    erosLevel === 'transgressive'

  return (
    useErosCheckpoint
      ? process.env.COMFYUI_CHECKPOINT_EROS || process.env.COMFYUI_CHECKPOINT_DEFAULT
      : process.env.COMFYUI_CHECKPOINT_DEFAULT
  ) || 'juggernautXL_ragnarokBy.safetensors'
}

function comfyHeaders() {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  const cfId = process.env.COMFYUI_CF_ACCESS_CLIENT_ID
  const cfSecret = process.env.COMFYUI_CF_ACCESS_CLIENT_SECRET

  if (cfId && cfSecret) {
    headers['CF-Access-Client-Id'] = cfId
    headers['CF-Access-Client-Secret'] = cfSecret
  }

  return headers
}

function injectWorkflow(workflow: Record<string, any>, body: Record<string, unknown>) {
  const positivePrompt = buildPositivePrompt(body)
  const negativePrompt = buildNegativePrompt(body)
  const checkpoint = chooseCheckpoint(body)
  const qualityMode = readQualityMode(body)
  const preset = QUALITY_PRESETS[qualityMode]
  const seed = readSeed(body)

  const kSamplerEntry = Object.entries(workflow).find(([, node]) => node.class_type === 'KSampler')
  const kSampler = kSamplerEntry?.[1]

  const positiveNodeId = Array.isArray(kSampler?.inputs?.positive) ? String(kSampler.inputs.positive[0]) : ''
  const negativeNodeId = Array.isArray(kSampler?.inputs?.negative) ? String(kSampler.inputs.negative[0]) : ''

  for (const [nodeId, node] of Object.entries(workflow)) {
    if (node.class_type === 'CheckpointLoaderSimple' && node.inputs?.ckpt_name !== undefined) {
      node.inputs.ckpt_name = checkpoint
    }

    if (node.class_type === 'CLIPTextEncode' && node.inputs?.text !== undefined) {
      if (nodeId === positiveNodeId) node.inputs.text = positivePrompt
      else if (nodeId === negativeNodeId) node.inputs.text = negativePrompt
    }

    if (node.class_type === 'EmptyLatentImage') {
      if (node.inputs?.width !== undefined) node.inputs.width = preset.width
      if (node.inputs?.height !== undefined) node.inputs.height = preset.height
      if (node.inputs?.batch_size !== undefined) node.inputs.batch_size = 1
    }

    if (node.class_type === 'KSampler') {
      if (node.inputs?.steps !== undefined) node.inputs.steps = preset.steps
      if (node.inputs?.cfg !== undefined) node.inputs.cfg = preset.cfg
      if (node.inputs?.sampler_name !== undefined) node.inputs.sampler_name = 'euler'
      if (node.inputs?.scheduler !== undefined) node.inputs.scheduler = 'normal'
      if (node.inputs?.seed !== undefined) node.inputs.seed = seed
    }

    if (node.class_type === 'SaveImage' && node.inputs?.filename_prefix !== undefined) {
      const deckId = readString(body.deckId, 'deck').replace(/[^a-zA-Z0-9_-]/g, '_')
      const cardId = String(body.cardId ?? 'card').replace(/[^a-zA-Z0-9_-]/g, '_')
      node.inputs.filename_prefix = `grimoire_${deckId}_${cardId}_${qualityMode}`
    }
  }

  return { workflow, qualityMode, preset, seed, checkpoint }
}

export default async function handler(req: NodeApiRequest, res: NodeApiResponse) {
  res.setHeader?.('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed.' })
  }

  const baseUrl = (process.env.COMFYUI_BASE_URL || 'http://127.0.0.1:8188').replace(/\/+$/, '')
  const body = (req.body || {}) as Record<string, unknown>

  try {
    const workflowPath = join(process.cwd(), 'api/comfy/workflow_api.json')
    const injected = injectWorkflow(
      JSON.parse(readFileSync(workflowPath, 'utf8')),
      body,
    )

    const response = await fetch(`${baseUrl}/prompt`, {
      method: 'POST',
      headers: comfyHeaders(),
      body: JSON.stringify({
        client_id: process.env.COMFYUI_CLIENT_ID || 'grimoire-xr',
        prompt: injected.workflow,
      }),
    })

    if (!response.ok) {
      const text = await response.text().catch(() => '')
      return res.status(502).json({
        ok: false,
        error: `ComfyUI prompt failed: ${response.status}`,
        details: text.slice(0, 1000),
      })
    }

    const json = await response.json() as { prompt_id?: string }

    if (!json.prompt_id) {
      return res.status(502).json({ ok: false, error: 'ComfyUI returned no prompt_id.' })
    }

    return res.status(200).json({
      ok: true,
      provider: 'comfyui',
      promptId: json.prompt_id,
      qualityMode: injected.qualityMode,
      width: injected.preset.width,
      height: injected.preset.height,
      steps: injected.preset.steps,
      seed: injected.seed,
      checkpoint: injected.checkpoint,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown ComfyUI start failure.'
    const errorCause =
      error && typeof error === 'object' && 'cause' in error
        ? String((error as { cause?: unknown }).cause)
        : undefined

    return res.status(500).json({
      ok: false,
      error: errorMessage,
      details: errorCause,
      comfyuiBaseUrl: baseUrl,
    })
  }
}
