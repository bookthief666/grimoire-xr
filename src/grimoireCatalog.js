// Shared 2D/XR creative catalog. Keep every interface on the same ritual,
// interpretive, and image-generation vocabulary.

export const EROS_LEVELS = [
  { level: 0, label: "OFF", context: "", prompt: "" },
  { level: 1, label: "SOFT", context: "Context: Romantic, intimate, emotional connection.", prompt: "romantic art, emotional intimacy" },
  { level: 2, label: "BOLD", context: "Context: Sensual, divine eros, sacred sexuality, Thelemic passion.", prompt: "sensual art, divine eros, sacred sexuality" },
  { level: 3, label: "ABYSS", context: "Context: Unfiltered desire, carnal spirituality, Babalon, ecstatic union.", prompt: "carnal art, high intensity, raw desire, masterpiece" },
  { level: 4, label: "LUST", context: "Context: Explicit, uninhibited, Dionysian ecstasy, unrestrained physical passion.", prompt: "explicit erotic art, high sensuality, Dionysian ecstasy, unrestrained passion, naked truth, masterpiece" },
  { level: 5, label: "BABALON", context: "Context: Absolute divine obscenity, pornographic mysticism, explicit occult sexuality, Babalon incarnate.", prompt: "highly explicit adult art, pornographic mysticism, divine obscenity, Kama Sutra, raw sexuality, uncensored occult eros, masterpiece" }
];

export const getErosContext = (level) => EROS_LEVELS[level]?.context || "";
export const getErosPrompt = (level) => EROS_LEVELS[level]?.prompt || "";

export const TECH_LEVELS = [
  { level: 0, label: "NEOPHYTE", desc: "Plain English. Practical & Emotional.", instruction: "Explain simply in plain English. Focus on practical advice and emotional resonance. Avoid jargon." },
  { level: 1, label: "ADEPT", desc: "Balanced. Archetypal & Astrological.", instruction: "Standard esoteric tone. Balance psychological archetypes with astrological correspondences." },
  { level: 2, label: "MAGUS", desc: "High Magick. Qabalah & Thelema.", instruction: "Dense, scholarly, and profound. Use Qabalistic terms (Sephiroth, Paths), Hebrew letters, and Thelemic cosmology explicitly." }
];

export const ART_STYLES = [
  { id: 'ren_allegory', name: 'Renaissance Allegory', cat: 'CLASSICAL', prompt: 'Renaissance allegorical painting style with idealized human proportions, divine geometry, soft natural light, balanced symmetry, classical drapery.' },
  { id: 'baroque_mystic', name: 'High Baroque', cat: 'CLASSICAL', prompt: 'High Baroque mystical painting style with dramatic chiaroscuro lighting, deep shadows, radiant illumination, emotional intensity, sacred drama.' },
  { id: 'dore_engrave', name: 'Gustave Doré', cat: 'CLASSICAL', prompt: 'Gustave Doré style wood engraving, high contrast black and white, biblical epic scale, intricate hatching, dramatic lighting.' },
  { id: 'medieval_ms', name: 'Illuminated Manuscript', cat: 'CLASSICAL', prompt: 'Medieval illuminated manuscript style with flat sacred perspective, symbolic hierarchy, gold accents, ornamental patterns.' },
  { id: 'bosch', name: 'Hieronymus Bosch', cat: 'CLASSICAL', prompt: 'Hieronymus Bosch style, surreal religious chaos, fantastical creatures, busy composition, strange machinery, moral allegory.' },
  { id: 'blake', name: 'William Blake', cat: 'CLASSICAL', prompt: 'William Blake prophetic etching, muscle definition, swirling energy, divine madness, watercolor wash over ink.' },
  { id: 'goya', name: 'Francisco Goya', cat: 'CLASSICAL', prompt: 'Goya Black Paintings style, dark romanticism, haunting faces, rough brushstrokes, psychological terror, somber palette.' },
  { id: 'art_nouveau', name: 'Art Nouveau', cat: 'CLASSICAL', prompt: 'Alphonse Mucha style Art Nouveau, intricate floral borders, flowing hair, haloed figures, soft pastel colors, elegance.' },
  { id: 'stained_glass', name: 'Gothic Stained Glass', cat: 'CLASSICAL', prompt: 'Gothic stained glass window style, vibrant luminous colors, leaded black lines, sacred geometry, light passing through glass.' },
  { id: 'baroque_macabre', name: 'Baroque Macabre', cat: 'CLASSICAL', prompt: 'Baroque macabre style, memento mori, ornate skulls, rich velvet, rotting fruit, fading beauty, intense chiaroscuro.' },
  { id: 'hermetic', name: 'Hermetic Alchemical', cat: 'ESOTERIC', prompt: 'Hermetic alchemical illustration style with symbolic vessels, celestial correspondences, allegorical figures, sacred geometry, parchment texture.' },
  { id: 'crowley', name: 'Thelemic / Crowley', cat: 'ESOTERIC', prompt: 'Modern occult symbolism style with bold color fields, abstract sacred forms, erotic mysticism, magical intensity, ritual power.' },
  { id: 'spare', name: 'Austin Osman Spare', cat: 'ESOTERIC', prompt: 'Automatic drawing style with sigil-like linework, subconscious symbolism, raw gestural marks, chaotic yet intentional forms.' },
  { id: 'zodiac', name: 'Zodiac Engraving', cat: 'ESOTERIC', prompt: 'Celestial engraving style with astrological machinery, planetary symbolism, star maps, fate mechanics, cosmic precision.' },
  { id: 'voynich', name: 'Voynich Manuscript', cat: 'ESOTERIC', prompt: 'Voynich manuscript style, undecipherable text, strange botanical illustrations, astro-biological diagrams, vellum texture.' },
  { id: 'gd_sketch', name: 'Golden Dawn Sketch', cat: 'ESOTERIC', prompt: 'Golden Dawn magical diary sketch, rough pencil on old paper, flashing colors, precise geometric sigils, esoteric notes.' },
  { id: 'bohemian', name: 'Tarot of Bohemians', cat: 'ESOTERIC', prompt: 'Papus Tarot of the Bohemians style, 19th-century French occultism, esoteric wheels, syncretic symbolism, black and white line art.' },
  { id: 'egypt', name: 'Egyptian Papyrus', cat: 'ANCIENT', prompt: 'Ancient Egyptian papyrus art, profile figures, hieroglyphics, gold and lapis lazuli, book of the dead aesthetic.' },
  { id: 'aztec', name: 'Aztec Codex', cat: 'ANCIENT', prompt: 'Aztec codex style, flat geometric figures, bold earth tones, turquoise, obsidian, jaguar and serpent motifs.' },
  { id: 'celtic', name: 'Celtic Knotwork', cat: 'ANCIENT', prompt: 'Celtic illuminated art, intricate endless knotwork, zoomorphic borders, book of kells style, green and gold.' },
  { id: 'sumerian', name: 'Sumerian Tablet', cat: 'ANCIENT', prompt: 'Cuneiform clay tablet style, relief carving, mesopotamian deities, winged bulls, star maps, ancient stone texture.' },
  { id: 'pixel', name: '16-Bit Sovereign', cat: 'MODERN', prompt: '16-bit pixel art masterpiece, SNES RPG style, deep color palette, isometric perspective, magical aura, detailed sprite work.' },
  { id: 'gameboy', name: 'GB Green', cat: 'MODERN', prompt: 'Gameboy 4-color green palette, dot matrix texture, nostalgia, limited resolution, handheld gaming aesthetic.' },
  { id: 'cyber', name: 'Cyberpunk Occult', cat: 'MODERN', prompt: 'Cyberpunk occult style with neon glyphs, techno-mysticism, digital ritual symbols, futuristic divination, glitch artifacts.' },
  { id: 'vapor', name: 'Vaporwave', cat: 'MODERN', prompt: 'Vaporwave aesthetic with surreal nostalgia, pastel gradients, symbolic decay, temporal distortion, greek statues.' },
  { id: 'bauhaus', name: 'Bauhaus Design', cat: 'MODERN', prompt: 'Bauhaus graphic design, geometric minimalism, primary colors, sharp angles, industrial mysticism, typography focus.' },
  { id: 'basquiat', name: 'Neo-Expressionist', cat: 'MODERN', prompt: 'Jean-Michel Basquiat style, raw scribbles, crowns, skulls, anatomy diagrams, urban primitive, text overlays.' },
  { id: 'popart', name: 'Warhol Pop', cat: 'MODERN', prompt: 'Andy Warhol pop art style, silkscreen texture, vibrant contrasting colors, repetition, mass media occultism.' },
  { id: 'synthwave', name: 'Synthwave Neon', cat: 'MODERN', prompt: 'Synthwave aesthetic, neon grids, retro sun, chrome reflections, dark starry sky, futuristic nostalgia.' },
  { id: 'retro_anime', name: '90s OVA Anime', cat: 'MODERN', prompt: '1990s dark fantasy OVA anime style, cel shaded, deep shadows, dramatic perspective, detailed linework, melancholic mood.' },
  { id: 'dream', name: 'Dream Surrealism', cat: 'SURREAL', prompt: 'Dreamlike surrealism with melting forms, warped time, subconscious symbolism, impossible architecture, lucid nightmare logic.' },
  { id: 'giger', name: 'Bio-Mechanical', cat: 'SURREAL', prompt: 'H.R. Giger style, biomechanical surrealism, monochromatic, airbrush texture, organic machinery, dark atmosphere.' },
  { id: 'lovecraft', name: 'Cosmic Horror', cat: 'SURREAL', prompt: 'Lovecraftian cosmic horror, sketches from a madman\'s journal, tentacles, non-euclidean geometry, dark scribbles, madness.' },
  { id: 'folk', name: 'Folk Horror', cat: 'SURREAL', prompt: 'Midsommar folk horror style, bright daylight, flowers, runes, unsettling smiles, pagan rituals, nature reclaiming flesh.' },
  { id: 'biopunk', name: 'Flesh & Wire', cat: 'SURREAL', prompt: 'Biopunk aesthetic, genetic modification, fleshy technology, wetware, cronenberg body horror, neon veins.' },
  { id: 'gothic_horror', name: 'Gothic Horror', cat: 'SURREAL', prompt: 'Victorian gothic horror, gaslight, fog, jagged architecture, vampires, bloodborne aesthetic, dark elegance.' },
  { id: 'collage', name: 'Surrealist Collage', cat: 'SURREAL', prompt: 'Max Ernst surrealist collage style, disjointed vintage engravings, absurd combinations, dream logic, paper cutouts.' },
  { id: 'dark_fantasy', name: 'Dark Fantasy', cat: 'SURREAL', prompt: 'Frank Frazetta dark fantasy style, muscular figures, looming monsters, oil painting, dramatic action, desolate landscapes.' },
  { id: 'liminal', name: 'Liminal Space', cat: 'SURREAL', prompt: 'Liminal space photography style, empty endless corridors, unsettling familiarity, fluorescent lighting, backrooms aesthetic, eerily quiet.' },
  { id: 'ukiyo', name: 'Ukiyo-e Woodblock', cat: 'EAST ASIAN', prompt: 'Ukiyo-e woodblock print style with bold outlines, flat color planes, symbolic motion, impermanence themes.' },
  { id: 'sumie', name: 'Sumi-e Ink', cat: 'EAST ASIAN', prompt: 'Ink wash painting style with expressive brushwork, emptiness, void symbolism, minimalism, spiritual gesture.' },
  { id: 'glitch', name: 'Glitch Occultism', cat: 'EXPERIMENTAL', prompt: 'Digital glitch occult style with corrupted symbols, ritual error, broken reality aesthetics, datamoshing.' },
  { id: 'fractal', name: 'Fractal Geometry', cat: 'EXPERIMENTAL', prompt: 'Fractal geometry style with infinite recursion, sacred mathematics, archetypal emergence, mandalas.' },
  { id: 'sacred_eros', name: 'Sacred Eros', cat: 'EXPERIMENTAL', prompt: 'Sacred geometry fused with subtle erotic mysticism, divine sensuality, spiritual embodiment, ritual intimacy.' },
  { id: 'blueprint', name: 'Spirit Blueprint', cat: 'EXPERIMENTAL', prompt: 'Technical blueprint style, cyanotype, white lines on blue, schematic of the soul, dimensional measurements.' },
  { id: 'papercut', name: 'Papercut Diorama', cat: 'EXPERIMENTAL', prompt: 'Layered papercut diorama style, depth of field, shadows, intricate cutouts, storytelling, whimsical yet dark.' },
  { id: 'impasto', name: 'Oil Impasto', cat: 'EXPERIMENTAL', prompt: 'Thick oil paint impasto style, visible palette knife strokes, texture, vibrancy, physical presence of paint.' },
  { id: 'geometric', name: 'Geometric Abstract', cat: 'EXPERIMENTAL', prompt: 'Kandinsky style geometric abstraction, spiritual harmony, floating shapes, lines, non-representational soul.' },
  { id: 'psychedelic', name: '70s Psychedelic', cat: 'EXPERIMENTAL', prompt: '1970s psychedelic blacklight poster style, melting vibrant neon colors, kaleidoscopic patterns, cosmic third eye.' },
  { id: 'dada', name: 'Dadaism', cat: 'EXPERIMENTAL', prompt: 'Dadaist art style, anti-art, chaotic typography, absurdism, societal collapse, found objects, rebellious meaninglessness.' },
  { id: 'chalkboard', name: 'Chalkboard Grimoire', cat: 'EXPERIMENTAL', prompt: 'Chalkboard mathematical grimoire, dusty blackboard, complex chalk equations, spirit diagrams, erased smudges, esoteric physics.' }
];

export const TRADITIONS = [
  { id: 'thoth', name: 'Book of Thoth', desc: 'Crowley & Harris - High Magick' },
  { id: 'rws', name: 'Rider-Waite-Smith', desc: 'Golden Dawn Standard' },
  { id: 'marseille', name: 'Tarot de Marseille', desc: 'Traditional Iconography' },
  { id: 'hermetic', name: 'Hermetic Qabalah', desc: 'Tree of Life & Pathworking' },
  { id: 'shadow', name: 'Jungian Shadow', desc: 'Depth Psychology' },
  { id: 'enochian', name: 'Enochian Magick', desc: 'John Dee & Edward Kelley' },
  { id: 'chaos', name: 'Chaos Magick', desc: 'Sigils & Non-Dogmatic' },
  { id: 'voudon', name: 'Voudon Gnostic', desc: 'Michael Bertiaux - Nightside' },
  { id: 'alchemical', name: 'Alchemical', desc: 'Mutus Liber & Transmutation' },
  { id: 'bruno', name: 'Giordano Bruno', desc: 'Shadows of Ideas & Mnemonic Wheels' },
  { id: 'astarte', name: 'Astarte / Venus', desc: 'Devotion, Eros & Planetary Theurgy' }
];
