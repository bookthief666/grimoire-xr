import { z } from 'zod'
import { TAROT_SYSTEM_IDS } from '../constants/tarotSystems'
import { EROS_LEVEL_IDS } from '../constants/erosLevels'
import { ART_STYLE_IDS } from '../constants/artStyles'

export const tarotSystemSchema = z.enum(TAROT_SYSTEM_IDS)

export const traditionSchema = z.enum([
  'thelemic',
  'hermetic',
  'goetic',
  'tarot',
  'kabbalistic',
  'tantric',
  'chaos_magick',
])

export const toneSchema = z.enum([
  'scholarly',
  'oracular',
  'visionary',
  'severe',
  'ecstatic',
])

export const techLevelSchema = z.enum([
  'neophyte',
  'adept',
  'magus',
])

export const artStyleSchema = z.enum(ART_STYLE_IDS)

export const visualStyleSchema = z.enum([
  'Hierophantic',
  'Astral',
  'Venusian',
  'Goetic',
  'Alchemical',
  'Xenotheurgic',
])

export const erosLevelSchema = z.enum(EROS_LEVEL_IDS)

export const erosFieldSchema = z.enum([
  'Veiled',
  'Charged',
  'Ecstatic',
])

export const imageStatusSchema = z.enum([
  'pending',
  'generating',
  'ready',
  'error',
])

export const ritualConfigSchema = z.object({
  subject: z.string().min(2),
  tradition: traditionSchema,
  tarotSystem: tarotSystemSchema.optional(),
  tone: toneSchema,
  techLevel: techLevelSchema,
  visualStyle: visualStyleSchema.optional(),
  artStyle: artStyleSchema.optional(),
  erosField: erosFieldSchema.optional(),
  erosLevel: erosLevelSchema.optional(),
  intent: z.string().min(4).max(400).optional(),
})

export const cardMetadataSchema = z.object({
  element: z.string().min(2),
  planet: z.string().min(2),
  polarity: z.enum(['ascending', 'descending', 'balanced']),
  keywords: z.array(z.string().min(2)).min(2).max(6),
  alchemical: z.string().min(2).optional(),
  hebrew: z.string().min(1).optional(),
  daimon: z.string().min(2).optional(),
  gematria: z.number().int().nonnegative().optional(),
})

export const grimoireCardSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(2),
  sigil: z.string().min(2),
  exegesis: z.string().min(12),
  ritualFunction: z.string().min(12).optional(),
  artPrompt: z.string().min(24).optional(),
  imageUrl: z.string().min(8).optional(),
  imageStatus: imageStatusSchema.optional(),
  metadata: cardMetadataSchema,
})

export const subjectDossierSchema = z.object({
  subject: z.string().min(2),
  archetype: z.string().min(2),
  omen: z.string().min(2),
  summary: z.string().min(12),
  magicalDiagnosis: z.string().min(12).optional(),
  operativeAdvice: z.string().min(12).optional(),
  suggestedQuestions: z.array(z.string().min(8)).max(3).optional(),
})

export const grimoireDeckSchema = z.object({
  id: z.string().min(8),
  name: z.string().min(3),
  subject: z.string().min(2),
  createdAt: z.string().datetime(),
  dossier: subjectDossierSchema,
  cards: z.array(grimoireCardSchema).min(3),
})

export const oracleDrawnCardSchema = z.object({
  cardId: z.number().int().positive(),
  cardName: z.string().min(2),
  position: z.string().min(2),
  interpretation: z.string().min(12),
  operativeInstruction: z.string().min(12),
})

export const oracleReadingSchema = z.object({
  id: z.string().min(8),
  question: z.string().min(3),
  createdAt: z.string().datetime(),
  spreadName: z.string().min(2),
  answer: z.string().min(24),
  diagnosis: z.string().min(12),
  prescription: z.string().min(12),
  warning: z.string().min(12).optional(),
  drawnCards: z.array(oracleDrawnCardSchema).min(1).max(4),
  keywords: z.array(z.string().min(2)).min(2).max(8),
})

export const oracleConsultationRequestSchema = z.object({
  config: ritualConfigSchema,
  deck: grimoireDeckSchema,
  question: z.string().min(3).max(800),
  selectedCardIds: z.array(z.number().int().positive()).min(1).max(4).optional(),
})

export const forgePhaseSchema = z.enum(['idle', 'forging', 'ready', 'error'])

export const ritualSelectionSchema = z.object({
  focusedCardId: z.number().int().positive().nullable(),
  altarCardId: z.number().int().positive().nullable(),
})

export type TarotSystem = z.infer<typeof tarotSystemSchema>
export type Tradition = z.infer<typeof traditionSchema>
export type Tone = z.infer<typeof toneSchema>
export type TechLevel = z.infer<typeof techLevelSchema>
export type VisualStyle = z.infer<typeof visualStyleSchema>
export type ArtStyle = z.infer<typeof artStyleSchema>
export type ErosLevel = z.infer<typeof erosLevelSchema>
export type ErosField = z.infer<typeof erosFieldSchema>
export type ImageStatus = z.infer<typeof imageStatusSchema>
export type RitualConfig = z.infer<typeof ritualConfigSchema>

export type CardMetadata = z.infer<typeof cardMetadataSchema>
export type GrimoireCard = z.infer<typeof grimoireCardSchema>
export type SubjectDossier = z.infer<typeof subjectDossierSchema>
export type GrimoireDeck = z.infer<typeof grimoireDeckSchema>

export type OracleDrawnCard = z.infer<typeof oracleDrawnCardSchema>
export type OracleReading = z.infer<typeof oracleReadingSchema>
export type OracleConsultationRequest = z.infer<typeof oracleConsultationRequestSchema>

export type ForgePhase = z.infer<typeof forgePhaseSchema>
export type RitualSelection = z.infer<typeof ritualSelectionSchema>
