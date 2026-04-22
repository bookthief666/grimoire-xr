import { z } from 'zod'

export const cardMetadataSchema = z.object({
  element: z.string().min(2),
  planet: z.string().min(2),
  polarity: z.enum(['ascending', 'descending', 'balanced']),
  keywords: z.array(z.string().min(2)).min(2).max(6),
})

export const grimoireCardSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(2),
  sigil: z.string().min(2),
  exegesis: z.string().min(12),
  metadata: cardMetadataSchema,
})

export const subjectDossierSchema = z.object({
  subject: z.string().min(2),
  archetype: z.string().min(2),
  omen: z.string().min(2),
  summary: z.string().min(12),
})

export const grimoireDeckSchema = z.object({
  id: z.string().min(8),
  name: z.string().min(3),
  subject: z.string().min(2),
  createdAt: z.string().datetime(),
  dossier: subjectDossierSchema,
  cards: z.array(grimoireCardSchema).min(3),
})

export const forgePhaseSchema = z.enum(['idle', 'forging', 'ready', 'error'])

export const ritualSelectionSchema = z.object({
  focusedCardId: z.number().int().positive().nullable(),
  altarCardId: z.number().int().positive().nullable(),
})

export type CardMetadata = z.infer<typeof cardMetadataSchema>
export type GrimoireCard = z.infer<typeof grimoireCardSchema>
export type SubjectDossier = z.infer<typeof subjectDossierSchema>
export type GrimoireDeck = z.infer<typeof grimoireDeckSchema>
export type ForgePhase = z.infer<typeof forgePhaseSchema>
export type RitualSelection = z.infer<typeof ritualSelectionSchema>
