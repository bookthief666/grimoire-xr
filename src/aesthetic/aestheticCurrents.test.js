import { describe, expect, it } from 'vitest';
import {
  AESTHETIC_CURRENTS,
  ENCHANTMENT_LEVELS,
  cycleAestheticCurrent,
  cycleEnchantmentLevel,
  getAestheticCurrent,
  persistAestheticPreferences,
  resolveAestheticPreferences,
} from './aestheticCurrents.js';

const memoryStorage = () => {
  const values = new Map();
  return {
    getItem: key => values.get(key) || null,
    setItem: (key, value) => values.set(key, String(value)),
  };
};

describe('aesthetic currents', () => {
  it('preserves ARCANE OS as a first-class reversible profile', () => {
    const arcane = getAestheticCurrent('arcane');
    expect(arcane.id).toBe('arcane-os');
    expect(arcane.label).toBe('ARCANE OS');
    expect(arcane.authority).toBe('PROJECT_AUTHORED_PRESENTATION_PROFILE_NOT_SOURCE_FACT');
  });

  it('defaults to the rich Ritual Hybrid rather than a minimalist profile', () => {
    expect(resolveAestheticPreferences()).toEqual({
      current: 'ritual-hybrid',
      enchantment: 'balanced',
      queryOverride: false,
    });
  });

  it('supports direct A/B query overrides', () => {
    expect(resolveAestheticPreferences({ search: '?look=arcane&fx=exalted' })).toEqual({
      current: 'arcane-os',
      enchantment: 'exalted',
      queryOverride: true,
    });
    expect(resolveAestheticPreferences({ search: '?aesthetic=book&enchantment=vivid' }).current).toBe('living-book');
  });

  it('persists profile and enchantment independently', () => {
    const storage = memoryStorage();
    expect(persistAestheticPreferences({ current: 'living-book', enchantment: 'exalted' }, storage)).toBe(true);
    expect(resolveAestheticPreferences({ storage })).toEqual({
      current: 'living-book',
      enchantment: 'exalted',
      queryOverride: false,
    });
  });

  it('cycles without deleting any profile or intensity tier', () => {
    let current = AESTHETIC_CURRENTS[0].id;
    for (let index = 0; index < AESTHETIC_CURRENTS.length; index += 1) current = cycleAestheticCurrent(current);
    expect(current).toBe(AESTHETIC_CURRENTS[0].id);

    let enchantment = ENCHANTMENT_LEVELS[0].id;
    for (let index = 0; index < ENCHANTMENT_LEVELS.length; index += 1) enchantment = cycleEnchantmentLevel(enchantment);
    expect(enchantment).toBe(ENCHANTMENT_LEVELS[0].id);
  });
});
