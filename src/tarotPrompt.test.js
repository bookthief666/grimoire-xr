import { describe, expect, it } from 'vitest';
import { compileTarotImagePrompt } from './tarotPrompt.js';

describe('structured tarot image prompt compiler', () => {
  it('organizes semantic, symbolic, aesthetic, framing, and constraint layers', () => {
    const prompt = compileTarotImagePrompt({
      cardName: 'The High Priestess',
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
    expect(prompt).toContain('TAROT SYSTEM: Thoth.');
    expect(prompt).toContain('COMPOSITION AND ICONOGRAPHY: A veiled priestess');
    expect(prompt).toContain('Hebrew letter: Gimel');
    expect(prompt).toContain('Astrological ruler: Moon');
    expect(prompt).toContain('ART DIRECTION: ornate pixel-art mysticism.');
    expect(prompt).toContain('AESTHETIC REGISTER: 16-Bit Sovereign.');
    expect(prompt).toContain('FRAMING: premium vertical tarot-card illustration');
    expect(prompt).toContain('CONSTRAINTS: no captions, no typography');
  });

  it('normalizes whitespace and omits absent optional layers', () => {
    const prompt = compileTarotImagePrompt({
      cardName: '  The   Fool  ',
      visual: '  traveler   at the precipice ',
    });

    expect(prompt).toContain('Tarot card "The Fool"');
    expect(prompt).toContain('COMPOSITION AND ICONOGRAPHY: traveler at the precipice.');
    expect(prompt).not.toContain('TAROT SYSTEM:');
    expect(prompt).not.toContain('CORRESPONDENCES:');
  });

  it('rejects an empty card name', () => {
    expect(() => compileTarotImagePrompt({ cardName: '   ' })).toThrow('A card name is required');
  });
});
