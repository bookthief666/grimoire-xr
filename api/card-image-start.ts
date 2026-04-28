import fs from 'fs'
import path from 'path'

type NodeApiRequest = {
  method?: string
  body?: unknown
}

type NodeApiResponse = {
  setHeader?: (name: string, value: string) => void
  status: (statusCode: number) => NodeApiResponse
  json: (body: unknown) => void
}

function readString(value: unknown, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

function buildPositivePrompt(body: Record<string, unknown>) {
  return [
    'masterpiece, best quality, highly detailed dark occult tarot illustration',
    'vertical tarot-card-safe composition, central symbolic figure or ritual tableau',
    'hermetic, alchemical, sacred geometry, cinematic lighting, polished fantasy realism',
    'no text, no watermark, no logo',
    readString(body.cardName),
    readString(body.sigil) ? `sigil motif: ${readString(body.sigil)}` : '',
    readString(body.artPrompt),
    readString(body.visualStyle) ? `visual style: ${readString(body.visualStyle)}` : '',
    readString(body.erosField) ? `mood: ${readString(body.erosField)}` : '',
  ].filter(Boolean).join(', ')
}

function buildNegativePrompt() {
  return [
    'text, letters, words, watermark, signature, logo',
    'blurry, low quality, low resolution, bad anatomy, extra fingers, extra limbs',
    'cropped, duplicate, ugly, distorted, malformed face, broken hands',
  ].join(', ')
}

function chooseCheckpoint(body: Record<string, unknown>) {
  const erosField = readString(body.erosField)
  const eros = erosField === 'Charged' || erosField === 'Ecstatic'

  return (
    eros
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
  const negativePrompt = buildNegativePrompt()
  const checkpoint = chooseCheckpoint(body)

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
      if (node.inputs?.width !== undefined) node.inputs.width = 768
      if (node.inputs?.height !== undefined) node.inputs.height = 1152
      if (node.inputs?.batch_size !== undefined) node.inputs.batch_size = 1
    }

    if (node.class_type === 'KSampler') {
      if (node.inputs?.steps !== undefined) node.inputs.steps = 24
      if (node.inputs?.cfg !== undefined) node.inputs.cfg = 6.5
      if (node.inputs?.sampler_name !== undefined) node.inputs.sampler_name = 'euler'
      if (node.inputs?.scheduler !== undefined) node.inputs.scheduler = 'normal'
      if (node.inputs?.seed !== undefined) {
        node.inputs.seed = Math.floor(Math.random() * 2147483647)
      }
    }

    if (node.class_type === 'SaveImage' && node.inputs?.filename_prefix !== undefined) {
      const deckId = readString(body.deckId, 'deck').replace(/[^a-zA-Z0-9_-]/g, '_')
      const cardId = String(body.cardId ?? 'card').replace(/[^a-zA-Z0-9_-]/g, '_')
      node.inputs.filename_prefix = `grimoire_${deckId}_${cardId}`
    }
  }

  return workflow
}

export default async function handler(req: NodeApiRequest, res: NodeApiResponse) {
  res.setHeader?.('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed.' })
  }

  const baseUrl = (process.env.COMFYUI_BASE_URL || 'http://127.0.0.1:8188').replace(/\/+$/, '')
  const body = (req.body || {}) as Record<string, unknown>

  try {
    const workflowPath = path.join(process.cwd(), 'api/comfy/workflow_api.json')
    const workflow = injectWorkflow(
      JSON.parse(fs.readFileSync(workflowPath, 'utf8')),
      body,
    )

    const response = await fetch(`${baseUrl}/prompt`, {
      method: 'POST',
      headers: comfyHeaders(),
      body: JSON.stringify({
        client_id: process.env.COMFYUI_CLIENT_ID || 'grimoire-xr',
        prompt: workflow,
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
    })
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown ComfyUI start failure.',
    })
  }
}
