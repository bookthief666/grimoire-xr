import {
  grimoireDeckSchema,
  grimoireCardSchema,
  subjectDossierSchema,
  type GrimoireCard,
  type GrimoireDeck,
  type SubjectDossier,
} from '../types/grimoire'

const ARCHETYPES = [
  'Keeper of the Hidden Chamber',
  'Pilgrim of the Obsidian Threshold',
  'Bearer of the Ember Crown',
  'Witness of the Silent Seal',
]

const OMENS = [
  'A brass bell tolls where no hand is seen.',
  'The shrine ember bends toward your name.',
  'Three veils part in the same breath.',
  'An old oath answers from beneath the floor sigil.',
]

const CARD_TITLES = [
  'The Obsidian Gate',
  'The Ember Litany',
  'The Crown of Salt',
  'The Veiled Meridian',
  'The Brass Axiom',
  'The Ninth Seal',
]

const ELEMENTS = ['Fire', 'Air', 'Water', 'Earth', 'Aether']
const PLANETS = ['Saturn', 'Moon', 'Mars', 'Venus', 'Mercury', 'Jupiter']

const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

function hashSubject(subject: string) {
  return Array.from(subject).reduce((acc, char, index) => {
    return (acc + char.charCodeAt(0) * (index + 17)) % 100_003
  }, 0)
}

function pickFrom<T>(items: T[], seed: number, step: number) {
  return items[(seed + step) % items.length]
}

function buildCard(subject: string, baseSeed: number, index: number): GrimoireCard {
  const title = pickFrom(CARD_TITLES, baseSeed, index * 3)
  const element = pickFrom(ELEMENTS, baseSeed, index * 5)
  const planet = pickFrom(PLANETS, baseSeed, index * 7)

  const firstWord = subject.trim().split(/\s+/)[0] || 'Subject'

  const card = {
    id: index + 1,
    name: title,
    sigil: `SIGIL-${(baseSeed + index * 13).toString(16).toUpperCase()}`,
    exegesis: `${title} teaches how ${subject} may transmute pressure into deliberate will. Hold the line between devotion and discipline, and let the chamber answer with measured fire.`,
    metadata: {
      element,
      planet,
      polarity: index % 3 === 0 ? 'ascending' : index % 3 === 1 ? 'balanced' : 'descending',
      keywords: [firstWord, element, 'Discipline', 'Threshold'],
    },
  }

  return grimoireCardSchema.parse(card)
}

export async function generateSubjectDossier(subject: string): Promise<SubjectDossier> {
  const normalizedSubject = subject.trim()
  const seed = hashSubject(normalizedSubject)

  await pause(350)

  const dossier = {
    subject: normalizedSubject,
    archetype: pickFrom(ARCHETYPES, seed, 3),
    omen: pickFrom(OMENS, seed, 11),
    summary: `${normalizedSubject} enters the forge under a severe but lucid current. The ritual should emphasize containment, symbolic precision, and clean intention before expansion.`,
  }

  return subjectDossierSchema.parse(dossier)
}

export async function generateDeck(subject: string): Promise<GrimoireDeck> {
  const normalizedSubject = subject.trim()
  const seed = hashSubject(normalizedSubject)

  const dossier = await generateSubjectDossier(normalizedSubject)
  await pause(550)

  const deck = {
    id: `deck-${seed.toString(16)}-${Date.now().toString(16)}`,
    name: `Arcanum of ${normalizedSubject}`,
    subject: normalizedSubject,
    createdAt: new Date().toISOString(),
    dossier,
    cards: Array.from({ length: 6 }, (_, index) => buildCard(normalizedSubject, seed, index)),
  }

  return grimoireDeckSchema.parse(deck)
}

export async function generateCardExegesis(card: GrimoireCard, subject: string) {
  await pause(120)
  return `${card.name} reflects ${subject} through ${card.metadata.element.toLowerCase()} and ${card.metadata.planet.toLowerCase()} correspondences.`
}

export async function generateCardMetadata(card: GrimoireCard) {
  await pause(120)
  return grimoireCardSchema.parse(card).metadata
}
