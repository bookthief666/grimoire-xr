import { describe, expect, it, vi } from 'vitest';
import {
  createDemoForgedCard,
  createDemoImage,
  createDemoOracleReading,
  createDemoRitual,
  createDemoSpiritReply,
  runDemoJob,
} from './vrDemo.js';

describe('provider-free Demo Current', () => {
  it('creates a deterministic complete tarot ritual', () => {
    const first = createDemoRitual('Giordano Bruno', { tradition: 'HERMETIC', aesthetic: '16-BIT' });
    const second = createDemoRitual('Giordano Bruno', { tradition: 'HERMETIC', aesthetic: '16-BIT' });
    expect(first).toEqual(second);
    expect(first.cards).toHaveLength(78);
    expect(first.cards[0].arcana).toBe('MAJOR');
    expect(first.cards[77].name).toContain('KING OF PENTACLES');
  });

  it('creates local forged matter and an embeddable SVG image', () => {
    const ritual = createDemoRitual('Astarte');
    const card = createDemoForgedCard({ seedCard: ritual.cards[3], index: 3, subject: 'Astarte', tradition: 'HERMETIC', aesthetic: 'PIXEL' });
    const image = createDemoImage({ title: card.name, seed: card.visual });
    expect(card.meta.alchemical).toMatch(/NIGREDO|ALBEDO|CITRINITAS|RUBEDO/);
    expect(image).toMatch(/^data:image\/svg\+xml/);
    expect(decodeURIComponent(image)).toContain('PROVIDER-FREE REHEARSAL');
  });

  it('keeps Oracle and Spirit output explicitly labeled as rehearsal', () => {
    const ritual = createDemoRitual('Babalon');
    const oracle = createDemoOracleReading({ subject: 'Babalon', question: 'What becomes will?', spread: { id: 'TRIAD' }, cards: ritual.cards.slice(0, 3), tradition: 'THELEMIC' });
    const spirit = createDemoSpiritReply({ subject: 'Babalon', question: 'What is the next act?' });
    expect(oracle).toContain('deterministic rehearsal');
    expect(oracle).toContain('What becomes will?');
    expect(spirit).toContain('not a quotation or supernatural claim');
  });

  it('simulates the same queued/running/ready contract as live providers', async () => {
    const onStatus = vi.fn();
    await expect(runDemoJob(() => ({ ok: true }), onStatus, 0)).resolves.toEqual({ ok: true });
    expect(onStatus.mock.calls.map(([status]) => status.status)).toEqual(['queued', 'running', 'ready']);
  });
});
