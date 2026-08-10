# Grimoire XR Source Provenance

Grimoire XR deliberately combines historical texts, translations, scholarship, application-authored ritual mechanics, and generative interpretation. Those layers must never be visually or technically collapsed into one another.

## Required content layers

Every authored instrument should classify displayed knowledge as one of:

1. **Primary source** — wording transcribed from a named edition/source.
2. **Translation** — a named translation or an explicitly identified working translation.
3. **Scholarly commentary** — interpretation tied to identifiable scholarship or editorial analysis.
4. **Operative reconstruction** — a Grimoire XR practice or spatial sequence inspired by historical material but authored for the application.
5. **Experimental correspondence** — a deterministic or symbolic mapping invented for the instrument and not claimed as historical attribution.

The runtime type contract lives in `src/tools/provenance.ts`.

## Non-negotiable rules

- Never present generated or reconstructed Latin/Hebrew/Greek as a quotation from a historical author.
- Never label an app-authored sequence with historical theorem/chapter numbering unless that mapping is sourced.
- Never infer a Tree-of-Life, Tarot, planetary, angelic, or other attribution and silently present it as the author's own table.
- Generative AI may interpret a source, but generated interpretation is a separate layer and may not overwrite the source text.
- When source-critical material is incomplete, the UI should say so rather than filling gaps with plausible prose.

## Current chamber status

### The Sanctum

The Sanctum is the **generative magical workstation**. Gemini produces dossier/card/oracle interpretation; ComfyUI produces card art. Generated material is not a historical-source layer.

### The Cell

`abulafia.ts` is currently an **operative reconstruction**. Letter permutation is historically inspired, while the exact 4-second inhale / 4-second exhale clock and fixed vowel-to-world-axis mapping are application mechanics pending source-critical citation.

### The Monad

`monas.ts` is currently an **operative reconstruction**. The six point/line/circle/sun/moon/cross phases are a VR construction grammar, not Dee's twenty-four-theorem sequence. The prior pseudo-Latin has been removed from the source slot and replaced with an explicit reconstruction notice.

Next source-edition work: add a verified theorem corpus containing source-language text, edition/citation, translation, and commentary as separate fields. Do not mutate the six-phase VR construction model to impersonate that corpus.

### The Chapel of Lies

`liber333.ts` uses a deterministic question-to-chapter draw and a chapter-to-Sephira working map. Those are **experimental correspondences**. Chapter numbers 0–93 are real to *Liber CCCXXXIII*; the application mapping is not asserted as Crowley's historical attribution.

The Tree visualization now uses 22 geometric links. Path-letter/Tarot assignments should be added only through a sourced attribution table.

## Review gate for new instruments

A new chamber is not source-complete until reviewers can answer:

- What is the primary work/source?
- Which edition or transcription is represented?
- Which text is quotation versus translation versus application copy?
- Which correspondences are historically sourced?
- Which mechanics are Grimoire XR reconstructions?
- Can the instrument function offline without inventing missing source material?
- If AI interpretation is enabled, can the original source still be recovered unchanged?
