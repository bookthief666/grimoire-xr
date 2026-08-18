import React from 'react';
import { Eye, Sparkles } from 'lucide-react';
import { AESTHETIC_CURRENTS, ENCHANTMENT_LEVELS, getAestheticCurrent, getEnchantmentLevel } from './aestheticCurrents.js';

export default function AestheticCurrentControl({ current, enchantment, onCurrentChange, onEnchantmentChange }) {
  const activeCurrent = getAestheticCurrent(current);
  const activeEnchantment = getEnchantmentLevel(enchantment);

  return (
    <section className="aesthetic-control" aria-label="Grimoire aesthetic current">
      <div className="aesthetic-control__head">
        <div>
          <span><Eye size={13} /> VISUAL CURRENT</span>
          <strong>{activeCurrent.label}</strong>
        </div>
        <p>{activeCurrent.description}</p>
      </div>

      <div className="aesthetic-control__profiles" role="group" aria-label="Visual profile">
        {AESTHETIC_CURRENTS.map(profile => (
          <button
            key={profile.id}
            type="button"
            className={profile.id === activeCurrent.id ? 'is-active' : ''}
            aria-pressed={profile.id === activeCurrent.id}
            onClick={() => onCurrentChange?.(profile.id)}
          >
            <span>{profile.shortLabel}</span>
          </button>
        ))}
      </div>

      <div className="aesthetic-control__enchantment">
        <div className="aesthetic-control__enchantment-head">
          <span><Sparkles size={13} /> ENCHANTMENT</span>
          <strong>{activeEnchantment.label}</strong>
        </div>
        <div className="aesthetic-control__levels" role="group" aria-label="Enchantment intensity">
          {ENCHANTMENT_LEVELS.map(level => (
            <button
              key={level.id}
              type="button"
              className={level.id === activeEnchantment.id ? 'is-active' : ''}
              aria-pressed={level.id === activeEnchantment.id}
              onClick={() => onEnchantmentChange?.(level.id)}
            >
              {level.label}
            </button>
          ))}
        </div>
      </div>

      <p className="aesthetic-control__note">
        Presentation only. Tarot facts, readings, provenance and generated artifacts are unchanged.
      </p>
    </section>
  );
}
