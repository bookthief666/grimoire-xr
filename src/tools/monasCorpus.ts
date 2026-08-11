// GENERATED FROM THE ORIGINAL APPLICATION — DO NOT HAND-EDIT.
//
// Source: bookthief666/monas-hieroglyphica, src/data/monasSentences.ts
// Ported verbatim: Latin, translation, paraphrase, source notes and every
// commentary register are byte-identical to the original edition.
//
// This replaces a placeholder. Before this port, every entry in monas.ts
// carried the literal string 'OPERATIVE RECONSTRUCTION — NOT A DEE QUOTATION'
// in its `latin` slot, because no sourced text was available to the XR app.
// It is available now, and it is genuinely Dee's — see `sourceNote`.
//
// ## Scope, which must not be smoothed over
//
// 13 sentences covering Dee's theorems 1, 2, 3, 4 and 6. The Monas
// Hieroglyphica has TWENTY-FOUR theorems. This is a sourced fragment, not the
// work. Do not present it as complete, and do not write new Latin to fill the
// gap — see MONAS_CORPUS_SCOPE in ./monas.ts.
//
// ## Two sequences, deliberately not merged
//
// `theorem` is Dee's numbering. `phase` is the glyph's construction order.
// They do not run parallel — theorem 1 is the `circle` phase and theorem 2
// covers both `line` and `point`. Both stay visible in the chamber.
//
// ## One rename
//
// The original tagged its final entry `cross-preview`. It is mapped to
// `cross` here so it joins the six-phase construction vocabulary, and the
// `provisional` flag preserves the fact that the original considered that
// entry a preview rather than settled.
//
// ## Provenance is per field
//
// `latin` is source text as transcribed by that edition, `english` is its
// translation, `paraphrase` and `layers` are its commentary. The
// `sourceNote` is that edition's own claim about its checking — carried here
// verbatim with attribution, not restated as this project's verification.
// See MONAS_FIELD_PROVENANCE in ./provenance.ts.

/** Interpretive registers the original edition writes commentary in. */
export type CommentaryRegister =
  | 'literal'
  | 'geometric'
  | 'astronomical'
  | 'cabalistic'
  | 'alchemical'
  | 'philological'
  | 'speculative'

export type MonasSentence = {
  id: string
  /** Dee's theorem number. NOT the construction-phase index. */
  theorem: number
  phase: 'point' | 'line' | 'circle' | 'sun' | 'moon' | 'cross'
  /** True where the original tagged this entry a preview rather than settled. */
  provisional: boolean
  /** Source text — Dee, as transcribed by the original edition. */
  latin: string
  /** That edition's translation of the Latin above. */
  english: string
  /** That edition's modern gloss. */
  paraphrase: string
  /** That edition's account of how the Latin was checked. Its claim, not ours. */
  sourceNote: string
  /** Commentary, by register. Partial by design — only what was written. */
  layers: Partial<Record<CommentaryRegister, string>>
  symbols: string[]
}

export const MONAS_SENTENCES: readonly MonasSentence[] = [
  {
    "id": "t1-s1",
    "theorem": 1,
    "phase": "circle",
    "provisional": false,
    "latin": "Per lineam rectam et circumferentiam, prima ac simplicissima fuit rerum, tum non existentium tum in natura latentium involucris, in lucem productio et repraesentatio.",
    "english": "By the straight line and the circumference, the first and simplest production into light and representation was made of things, both not-yet-existing and hidden in the veils of Nature.",
    "paraphrase": "Dee begins with a primal grammar: the line and the circle bring hidden things into intelligible form.",
    "sourceNote": "Checked against the 1564 Latin facsimile. The key term is circumferentiam: Dee says circumference rather than merely “circle,” emphasizing the act of boundary-making.",
    "layers": {
      "literal": "The first theorem says that line and circumference are the simplest means by which hidden or unmanifest things are brought into representation.",
      "geometric": "The straight line gives direction and measure; the circumference gives enclosure, return and totality.",
      "cabalistic": "The theorem can be read as a monadic emanation: unity extends into line, then closes into circumference.",
      "alchemical": "The hidden thing in the veils of Nature is not yet the stone, but the first intelligible outline of the Work.",
      "philological": "In lucem productio means “bringing forth into light.” Dee makes geometry perform an epistemological act: to draw is to disclose.",
      "speculative": "The interface renders this as a point stretching into line and turning into circumference."
    },
    "symbols": [
      "line",
      "circumference",
      "light",
      "nature"
    ]
  },
  {
    "id": "t2-s1",
    "theorem": 2,
    "phase": "line",
    "provisional": false,
    "latin": "At nec sine recta circulus artificiose fieri potest.",
    "english": "But a circle cannot be skillfully made without a straight line.",
    "paraphrase": "The circumference needs the radius; circularity depends on rectitude.",
    "sourceNote": "The Latin recta means a straight line; artificiose implies deliberate, skilled construction.",
    "layers": {
      "literal": "A circle requires a straight line for its construction.",
      "geometric": "The radius is the hidden straightness inside the circle; without it, the circumference cannot be measured or generated.",
      "philological": "Artificiose means “artfully” or “skillfully,” so Dee is discussing constructed mathematical art, not accidental shape.",
      "speculative": "Selecting this sentence reveals the hidden radius before the circle is permitted to appear."
    },
    "symbols": [
      "line",
      "circle",
      "radius"
    ]
  },
  {
    "id": "t2-s2",
    "theorem": 2,
    "phase": "point",
    "provisional": false,
    "latin": "Nec sine puncto recta artificiose fieri potest.",
    "english": "Nor can a straight line be skillfully made without the point.",
    "paraphrase": "Every line presupposes the point from which extension begins.",
    "sourceNote": "Puncto is the hinge of the theorem: the mathematical point becomes the metaphysical monad.",
    "layers": {
      "literal": "The straight line depends on the point.",
      "geometric": "A line is generated through the extension or flow of a point.",
      "cabalistic": "Multiplicity begins from unity. The dyad is not independent from the monad.",
      "speculative": "The glyph contracts to the primal point, the seed of the whole symbolic machine."
    },
    "symbols": [
      "point",
      "line",
      "monad"
    ]
  },
  {
    "id": "t2-s3",
    "theorem": 2,
    "phase": "point",
    "provisional": false,
    "latin": "Puncti proinde monadisque ratione, res et cetera coeperunt primo: et quae peripheria sunt affecta, quantiscumque fuerint, centralis puncti nullo modo carere possunt ministerio.",
    "english": "Therefore, by the rationale of the point and the Monad, things first began; and whatever things are affected by circumference, however great they may be, can in no way lack the ministry of the central point.",
    "paraphrase": "All circled worlds depend upon the central point; no circumference stands without its hidden center.",
    "sourceNote": "Ministerio is stronger than “service”: the central point performs an office or ministry within the circumference.",
    "layers": {
      "literal": "Every circumference depends on its central point.",
      "geometric": "The centre is not ornamental; it governs the possibility of circular form.",
      "astronomical": "This prepares the geocentric symbolism of Theorem 3, where the central point becomes Earth.",
      "cabalistic": "The point/monad is the principle by which multiplicity begins without ceasing to depend on unity.",
      "speculative": "The interface holds the centre illuminated even as larger structures appear around it."
    },
    "symbols": [
      "point",
      "monad",
      "circumference",
      "center"
    ]
  },
  {
    "id": "t3-s1",
    "theorem": 3,
    "phase": "sun",
    "provisional": false,
    "latin": "Monadis igitur hieroglyphicae conspicuum centrale punctum terram refert; circa quam, tum Sol tum Luna, reliquique planetae suos conficiunt cursus.",
    "english": "Therefore, the conspicuous central point of the Hieroglyphic Monad represents the Earth, around which both the Sun, the Moon, and the remaining planets complete their courses.",
    "paraphrase": "The metaphysical point is now assigned cosmological identity: it is Earth, the center of the visible courses.",
    "sourceNote": "Refert means “represents” or “bears reference to.” Dee is mapping a geometric point onto cosmological Earth.",
    "layers": {
      "literal": "The central point of the Monas stands for Earth.",
      "geometric": "The centre of the diagram becomes the axis of astronomical interpretation.",
      "astronomical": "Dee speaks within the inherited geocentric cosmology: Sun, Moon and planets complete their courses around Earth.",
      "speculative": "The app marks this by letting the point become the terrestrial centre inside the solar glyph."
    },
    "symbols": [
      "earth",
      "sun",
      "moon",
      "planets",
      "center"
    ]
  },
  {
    "id": "t3-s2",
    "theorem": 3,
    "phase": "sun",
    "provisional": false,
    "latin": "Et in hoc munere, quia dignitatem Sol obtinet summam, ipsum, per excellentiam, circulo notamus integro, centroque visibili.",
    "english": "And in this gift, because the Sun possesses the highest dignity, we mark it, by reason of its excellence, with a complete circle and a visible center.",
    "paraphrase": "The Sun receives the perfected sign: a complete circle whose center remains visible.",
    "sourceNote": "I have corrected the earlier working gloss here: per excellentiam is the key phrase, not “because of variation.”",
    "layers": {
      "literal": "The Sun is represented by a whole circle with visible center.",
      "geometric": "This is the first stable solar glyph: circumference plus centre.",
      "astronomical": "Solar dignity is expressed through the perfect figure of the circle.",
      "alchemical": "The Sun’s complete circle anticipates gold, perfection and fixed radiance.",
      "speculative": "The app now shows the solar circle as the first fully dignified body of the symbol."
    },
    "symbols": [
      "sun",
      "circle",
      "center",
      "dignity"
    ]
  },
  {
    "id": "t4-s1",
    "theorem": 4,
    "phase": "moon",
    "provisional": false,
    "latin": "Lunae hemicyclium, licet hic solari sit circulo quasi superius priusque;",
    "english": "Although the Moon’s semicircle is here, as it were, above and prior to the solar circle;",
    "paraphrase": "The Moon’s half-circle appears above the Sun, but this apparent priority is not final authority.",
    "sourceNote": "Hemicyclium means semicircle. Quasi signals that the superiority is visual or apparent, not absolute.",
    "layers": {
      "literal": "The Moon’s semicircle is placed above the Sun’s circle.",
      "geometric": "The lunar figure is incomplete circularity: a half-cycle above the whole solar circle.",
      "astronomical": "The visual order of the glyph is not identical with the hierarchy of celestial dignity.",
      "speculative": "The interface crowns the solar circle with a same-radius lunar arc."
    },
    "symbols": [
      "moon",
      "semicircle",
      "sun"
    ]
  },
  {
    "id": "t4-s2",
    "theorem": 4,
    "phase": "moon",
    "provisional": false,
    "latin": "Tamen Solem tamquam dominum regemque suum observat.",
    "english": "Nevertheless, she observes the Sun as her lord and king.",
    "paraphrase": "The Moon, though placed above, remains governed by the Sun.",
    "sourceNote": "Observat can mean watches, obeys, observes or keeps to: the Moon is visually and ontologically oriented toward the Sun.",
    "layers": {
      "literal": "The Moon is subordinate to the Sun.",
      "astronomical": "The Moon’s light is dependent upon the Sun.",
      "alchemical": "Luna receives and reflects the solar virtue.",
      "speculative": "The lunar arc brightens only when the solar body is already present."
    },
    "symbols": [
      "moon",
      "sun",
      "hierarchy"
    ]
  },
  {
    "id": "t4-s3",
    "theorem": 4,
    "phase": "moon",
    "provisional": false,
    "latin": "Eiusdem forma ac vicinitate adeo gaudere videtur, ut illum in semidiametri aemuletur magnitudine, vulgaribus apparente hominibus, et ad eundem semper suum convertat lumen.",
    "english": "She seems to rejoice so greatly in his form and nearness that she rivals him in the magnitude of her semidiameter, as it appears to ordinary people, and always turns her light toward him.",
    "paraphrase": "The Moon imitates the Sun’s apparent size and orients her light toward him.",
    "sourceNote": "Semidiametri is semidiameter/radius. Dee explicitly grounds this in vulgaribus apparentibus hominibus: the appearance to ordinary observers.",
    "layers": {
      "literal": "The Moon seems equal in radius to the Sun and turns her light toward him.",
      "geometric": "The lunar arc is drawn with the same radius as the solar circle.",
      "astronomical": "This captures the near equality of apparent solar and lunar diameters as seen from Earth.",
      "speculative": "The same-radius animation is not decorative; it encodes Dee’s visual argument."
    },
    "symbols": [
      "moon",
      "radius",
      "sun",
      "light"
    ]
  },
  {
    "id": "t4-s4",
    "theorem": 4,
    "phase": "moon",
    "provisional": false,
    "latin": "Solaribus ita tandem imbui radiis appetat, ut in eundem quasi transformata;",
    "english": "At length she desires so much to be imbued with solar rays that she is, as it were, transformed into him;",
    "paraphrase": "The lunar principle longs for solar infusion and symbolic transformation.",
    "sourceNote": "Imbui means soaked, filled or imbued. This is a language of reception, not mere illumination.",
    "layers": {
      "literal": "The Moon seeks to be filled with solar rays and transformed into the Sun.",
      "cabalistic": "The lesser receives the virtue of the greater without ceasing to mark difference.",
      "alchemical": "This is a conjunction of Sol and Luna, a basic alchemical drama of king and queen.",
      "speculative": "The lunar arc takes on solar radiance in the animation."
    },
    "symbols": [
      "sun",
      "moon",
      "rays",
      "transformation"
    ]
  },
  {
    "id": "t4-s5",
    "theorem": 4,
    "phase": "moon",
    "provisional": false,
    "latin": "Toto disparcat caelo;",
    "english": "She disappears from the whole sky;",
    "paraphrase": "At conjunction, the Moon vanishes into solar invisibility.",
    "sourceNote": "The facsimile OCR varies, but the sense is clear in context: the Moon disappears from the sky.",
    "layers": {
      "literal": "The Moon is no longer visible.",
      "astronomical": "This is the dark Moon or new Moon condition near solar conjunction.",
      "alchemical": "Union with solar radiance produces a temporary occultation.",
      "speculative": "The interface can later fade the lunar arc during this phase."
    },
    "symbols": [
      "moon",
      "invisibility",
      "conjunction"
    ]
  },
  {
    "id": "t4-s6",
    "theorem": 4,
    "phase": "moon",
    "provisional": false,
    "latin": "Donec aliquot post diebus, omnino hac qua depinximus, appareat corniculata figura.",
    "english": "Until, after several days, she appears in exactly this horned figure by which we have depicted her.",
    "paraphrase": "The Moon returns as crescent horns, the form Dee places in the glyph.",
    "sourceNote": "Corniculata figura means horned figure, hence the crescent-like lunar sign.",
    "layers": {
      "literal": "The Moon reappears as a horned crescent.",
      "geometric": "The lunar semicircle in the glyph is both shape and phase-symbol.",
      "astronomical": "This describes the waxing crescent after new Moon.",
      "speculative": "The arc returns above the Sun as the visible lunar horn."
    },
    "symbols": [
      "moon",
      "crescent",
      "horns"
    ]
  },
  {
    "id": "t6-preview",
    "theorem": 6,
    "phase": "cross",
    "provisional": true,
    "latin": "Solem Lunamque rectilineae cruci inniti hic videmus. Quae, tum ternarium, tum quaternarium, apposite satis, ratione hieroglyphica potest significare.",
    "english": "Here we see the Sun and Moon resting upon the rectilinear cross, which, by hieroglyphic reasoning, can quite fittingly signify both the ternary and the quaternary.",
    "paraphrase": "The glyph’s next revelation is the cross: a structure able to encode both three and four.",
    "sourceNote": "Theorem 6 is a preview in this prototype. It will become the bridge into element, body-spirit-soul, and septenary structure.",
    "layers": {
      "literal": "The Sun and Moon rest on a straight-lined cross.",
      "geometric": "Two lines plus their common point yield a ternary; four arms/angles yield a quaternary.",
      "cabalistic": "Three and four combine into seven, one of the governing numbers of the Monas.",
      "alchemical": "The cross is the elemental support beneath the solar-lunar marriage.",
      "speculative": "The interface unlocks the cross as the next symbolic stratum after the lunar arc."
    },
    "symbols": [
      "sun",
      "moon",
      "cross",
      "ternary",
      "quaternary"
    ]
  }
]
