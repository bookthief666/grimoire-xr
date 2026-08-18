# Grimoire XR Tarot Reference Layers

## 0.35 authority update

The original 0.9.0 `src/vr/tarotReference.js` table remains in the repository for archive/UI compatibility, but it is **not the authority source for new canonical Tarot semantics**.

The 0.35 Fold bridge is pinned to the versioned semantic contract in `bookthief666/tarot-archetype-vr`:

- contract: `grimoire.tarot.semantic.v1`
- contract version: `1.0.0`
- pinned upstream commit: `f4534b4f92d88f3950ec0c9c211bfa4648cd08ea`
- Fold adapter: `src/tarotBridge/canonicalTarotBridge.js`

For new Oracle and prompt-generation work, the canonical bridge owns:

- stable 0..77 legacy address -> canonical card ID mapping;
- source-qualified Book-of-Thoth expression fields;
- reviewed Thoth correspondence fields only;
- canonical spread identity/position semantics;
- explicit `relationMethod` selection;
- deterministic source-qualified TRIAD relation facts;
- relation/provenance reason codes.

The legacy table must not silently fill a canonical source gap. In particular, a Major Arcana card is not assigned an elemental suit merely because a historical or modern correspondence table could be found elsewhere; the current LXXVIII dignity kernel returns `UNSPECIFIED / CARD_WITHOUT_SUIT_FAMILY` for that adjacency.

Generated model output remains a separate interpretive layer:

- subject-specific manifestation title;
- exegesis;
- visual mnemonic;
- generated Hebrew/planetary/alchemical/daimon reflection where requested by the existing UI;
- image prompt elaboration.

0.35 labels those generated metadata fields as non-canonical and puts reviewed canonical facts ahead of them in image/Oracle prompts.

The compatibility table is retained so existing archives, VR-era UI surfaces, and older records do not break during migration. It should be removed or reduced only after deterministic cross-client parity and archive migration are proven.

---

## Historical 0.9.0 reference-layer design

Grimoire XR originally separated inherited Tarot structure from subject-specific interpretation using `src/vr/tarotReference.js`.

The application—not the language model—owned these fields:

- the 78-card order;
- Major versus Minor Arcana;
- suit and rank;
- Major-Arcana Hebrew letters and letter values;
- elemental, planetary, zodiacal, decanic, and court attributions;
- tradition-specific Book of Thoth nomenclature and the Heh/Tzaddi revision.

Qwen remained responsible for the creative layer:

- subject-specific card title;
- exegesis;
- visual mnemonic;
- symbolic element used in the new image;
- alchemical lens;
- mnemonic intelligence;
- practical magical or psychological operation.

The UI marked fixed metadata with `REFERENCE LOCKED`. Export and import reconstructed that fixed layer from the card ID, preventing old or foreign JSON from silently replacing it.

### Historical baselines and variants

The original fixed layer followed the Hermetic Order of the Golden Dawn system published by Crowley as *Liber LXXVIII: A Description of the Cards of the Tarot* and correspondence tables reproduced in *Book 4*, Appendix V.

Book of Thoth mode applied:

- Strength VIII becomes Lust XI;
- Justice XI becomes Adjustment VIII;
- Pages become Princesses;
- RWS-style Knights become Princes;
- RWS-style Kings become Knights;
- Pentacles become Disks;
- the Emperor receives Tzaddi and the Star receives Heh.

That table is now treated as a compatibility snapshot. 0.35's source-qualified contract supersedes it for newly migrated semantic operations.

### Repairing a card created before 0.9.0

1. Export the current palace as JSON before rebuilding. JSON preserves manifested images; browser autosave does not.
2. Restore that JSON after upgrading.
3. Open the old card. Its legacy inherited metadata can still be reconstructed from its integer card ID.
4. Re-scribe only when desired; existing manifested image/prompt/patina data should remain intact unless explicitly regenerated.
