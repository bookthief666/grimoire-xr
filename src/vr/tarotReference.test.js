import { describe, expect, it } from 'vitest';
import { TAROT_REFERENCES, getTarotReference, lockTarotReferenceMeta } from './tarotReference.js';

describe('auditable Tarot reference layer', () => {
  it('covers the complete canonical 78-card order', () => {
    expect(TAROT_REFERENCES).toHaveLength(78);
    expect(TAROT_REFERENCES[0].name).toBe('THE FOOL');
    expect(TAROT_REFERENCES[21].name).toBe('THE WORLD');
    expect(TAROT_REFERENCES[22].name).toBe('ACE OF WANDS');
    expect(TAROT_REFERENCES[77].name).toBe('KING OF PENTACLES');
  });

  it('locks the Empress to Daleth and Venus despite contradictory model output', () => {
    const meta = lockTarotReferenceMeta(3, 'Giordano Bruno', {
      hebrew: 'Men', planet: 'Sun', gematria: 44, element: 'Fire', alchemical: 'Rubedo',
    });
    expect(meta.inherited).toBe('THE EMPRESS · III');
    expect(meta.hebrew).toBe('DALETH (ד)');
    expect(meta.attribution).toBe('VENUS · PLANETARY TRUMP');
    expect(meta.gematria).toBe(4);
    expect(meta.symbolicElement).toBe('FIRE');
    expect(meta.alchemical).toBe('RUBEDO');
    expect(meta.validation).toBe('INHERITED REFERENCE LOCKED');
  });

  it('preserves Crowley\'s Heh/Tzaddi revision only for the Book of Thoth current', () => {
    expect(getTarotReference(4, 'hermetic').hebrew).toBe('HEH (ה)');
    expect(getTarotReference(17, 'hermetic').hebrew).toBe('TZADDI (צ)');
    expect(getTarotReference(4, 'Book of Thoth').hebrew).toBe('TZADDI (צ)');
    expect(getTarotReference(17, 'thoth').hebrew).toBe('HEH (ה)');
    expect(getTarotReference(8, 'Book of Thoth').inherited).toBe('LUST · XI');
    expect(getTarotReference(11, 'Book of Thoth').inherited).toBe('ADJUSTMENT · VIII');
    expect(getTarotReference(32, 'Book of Thoth').inherited).toBe('PRINCESS OF WANDS');
    expect(getTarotReference(77, 'Book of Thoth').inherited).toBe('KNIGHT OF DISKS');
  });

  it('provides the fixed decan and court baselines for the Minor Arcana', () => {
    expect(getTarotReference(23).attribution).toBe('MARS IN ARIES · 1ST DECAN');
    expect(getTarotReference(33).attribution).toBe('AIR OF FIRE · COURT FORM');
    expect(getTarotReference(77).attribution).toBe('FIRE OF EARTH · COURT FORM');
  });
});
