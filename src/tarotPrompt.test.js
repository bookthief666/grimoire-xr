import { describe, expect, it } from 'vitest';
import { TAROT_PROMPT_SCHEMA, compileTarotImagePrompt } from './tarotPrompt.js';

describe('structured tarot image prompt compiler', () => {
  it('exposes a stable prompt schema version', () => {
    expect(TAROT_PROMPT_SCHEMA).toBe('tarot-structured-v1');
  });

  it('organizes semantic, symbolic, invocation, aesthetic, framing, and constraint layers', () => {
    const prompt = compileTarotImagePrompt({
      cardName: 'The High Priestess',
      invocationSubject: 'Giordano Bruno',
      traditionName: 'Thoth',
      styleName: '16-Bit Sovereign',
      stylePrompt: 'ornate pixel-art mysticism',
      visual: 'A veiled priestess between two pillars with a lunar sea behind her',
      erosPrompt: 'sensual but hieratic and non-explicit',
      meta: {
        hebrew: 'Gimel',
        planet: 'Moon',
        alchemical: 'Solution',
        daimon: 'Luna',
      },
    });

    expect(prompt).toContain('SUBJECT: Tarot card "The High Priestess".');
    expect(prompt).toContain('INVOCATION SUBJECT: Giordano Bruno.');
    expect(prompt).toContain('TAROT SYSTEM: Thoth.');
    expect(prompt).toContain('COMPOSITION AND ICONOGRAPHY: A veiled priestess');
    expect(prompt).toContain('Hebrew letter: Gimel');
    expect(prompt).toContain('Astrological ruler: Moon');
    expect(prompt).toContain('GENERATED INTERPRETIVE NOTES (NON-CANONICAL)');
    expect(prompt).toContain('ART DIRECTION: ornate pixel-art mysticism.');
    expect(prompt).toContain('AESTHETIC REGISTER: 16-Bit Sovereign.');
    expect(prompt).toContain('FRAMING: premium vertical tarot-card illustration');
    expect(prompt).toContain('CONSTRAINTS: no captions, no typography');
  });

  it('places source-qualified canonical facts ahead of generated interpretive notes', () => {
    const prompt = compileTarotImagePrompt({
      cardName: 'A Personal Sword',
      traditionName: 'Book of Thoth',
      visual: 'a moonlit blade over geometric water',
      meta: { planet: 'Invented Planetary Reflection' },
      canonicalContext: {
        cardId: 'minor.swords.seven',
        sourceQualification: 'SOURCE_QUALIFIED',
        canonicalExpression: {
          displayName: { value: 'SEVEN OF SWORDS' },
          nativeTitle: { value: 'FUTILITY' },
        },
        canonicalCorrespondences: {
          planet: { value: 'MOON' },
          zodiacSign: { value: 'AQUARIUS' },
        },
      },
    });

    expect(prompt).toContain('CANONICAL CARD ID: minor.swords.seven.');
    expect(prompt).toContain('displayName=SEVEN OF SWORDS');
    expect(prompt).toContain('nativeTitle=FUTILITY');
    expect(prompt).toContain('planet=MOON');
    expect(prompt).toContain('zodiacSign=AQUARIUS');
    expect(prompt).toContain('CANONICALITY RULE: preserve these source-qualified facts.');
    expect(prompt.indexOf('REVIEWED CANONICAL CORRESPONDENCES')).toBeLessThan(
      prompt.indexOf('GENERATED INTERPRETIVE NOTES'),
    );
  });

  it('normalizes whitespace and omits absent optional layers', () => {
    const prompt = compileTarotImagePrompt({
      cardName: '  The   Fool  ',
      visual: '  traveler   at the precipice ',
    });

    expect(prompt).toContain('Tarot card "The Fool"');
    expect(prompt).toContain('COMPOSITION AND ICONOGRAPHY: traveler at the precipice.');
    expect(prompt).not.toContain('INVOCATION SUBJECT:');
    expect(prompt).not.toContain('TAROT SYSTEM:');
    expect(prompt).not.toContain('CANONICAL CARD ID:');
    expect(prompt).not.toContain('GENERATED INTERPRETIVE NOTES');
  });

  it('rejects an empty card name', () => {
    expect(() => compileTarotImagePrompt({ cardName: '   ' })).toThrow('A card name is required');
  });
});
