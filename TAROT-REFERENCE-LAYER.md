# Grimoire XR 0.9.0 — Auditable Tarot Reference Layer

Grimoire XR now separates inherited Tarot structure from subject-specific interpretation.

## The boundary

The application—not the language model—owns these fields:

- the 78-card order;
- Major versus Minor Arcana;
- suit and rank;
- Major-Arcana Hebrew letters and letter values;
- elemental, planetary, zodiacal, decanic, and court attributions;
- tradition-specific Book of Thoth nomenclature and the Heh/Tzaddi revision.

Qwen remains responsible for the creative layer:

- subject-specific card title;
- exegesis;
- visual mnemonic;
- symbolic element used in the new image;
- alchemical lens;
- mnemonic intelligence;
- practical magical or psychological operation.

The UI marks fixed metadata with `REFERENCE LOCKED`. Export and import reconstruct that fixed layer from the card ID, preventing old or foreign JSON from silently replacing it.

## Baselines and variants

The default fixed layer follows the Hermetic Order of the Golden Dawn system published by Crowley as *Liber LXXVIII: A Description of the Cards of the Tarot* and the principal correspondence tables reproduced in *Book 4*, Appendix V.

Book of Thoth mode deliberately applies Crowley's later system:

- Strength VIII becomes Lust XI;
- Justice XI becomes Adjustment VIII;
- Pages become Princesses;
- RWS-style Knights become Princes;
- RWS-style Kings become Knights;
- Pentacles become Disks;
- the Emperor receives Tzaddi and the Star receives Heh.

Primary-text references:

- <https://sacred-texts.com/oto/lib78.htm>
- <https://hermetic.com/crowley/book-4/app5>
- <https://hermetic.com/crowley/book-of-thoth/theory>
- <https://hermetic.com/crowley/book-of-thoth/atu>

This is a declared Hermetic/Golden Dawn baseline, not a claim that every historical Tarot school uses these correspondences.

## Repairing a card created before 0.9.0

1. Export the current palace as JSON before rebuilding. JSON preserves manifested images; browser autosave does not.
2. Install 0.9.0 and restore that JSON from Archive.
3. Open the old card. Its inherited metadata will already be corrected from its card ID.
4. Choose `RE-SCRIBE · LOCK REFERENCES` to regenerate the exegesis around the fixed correspondence.

Re-scribing preserves an existing manifested image, visual prompt, and patina. A new image is only created when explicitly requested.
