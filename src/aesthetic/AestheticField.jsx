import React, { memo, useMemo } from 'react';
import { getAestheticCurrent, getEnchantmentLevel } from './aestheticCurrents.js';

const PLANETARY_GLYPHS = ['☉', '☾', '☿', '♀', '♂', '♃', '♄'];
const MARGINALIA = ['AS ABOVE', 'AS BELOW', 'SOLVE', 'COAGULA'];

const deterministicMotes = Array.from({ length: 28 }, (_, index) => Object.freeze({
  id: index,
  left: `${4 + ((index * 37) % 92)}%`,
  top: `${8 + ((index * 53) % 84)}%`,
  size: 2 + (index % 4),
  delay: `${-((index * 0.73) % 11).toFixed(2)}s`,
  duration: `${9 + (index % 7) * 1.7}s`,
}));

const deterministicGlyphs = PLANETARY_GLYPHS.map((glyph, index) => Object.freeze({
  glyph,
  left: `${10 + index * 13}%`,
  top: `${18 + ((index * 29) % 58)}%`,
  delay: `${-(index * 1.2).toFixed(1)}s`,
}));

export default memo(function AestheticField({ current, enchantment, reducedMotion = false }) {
  const profile = useMemo(() => getAestheticCurrent(current), [current]);
  const level = useMemo(() => getEnchantmentLevel(enchantment), [enchantment]);
  const visibleMotes = Math.max(4, Math.round(deterministicMotes.length * level.density));
  const visibleGlyphs = Math.max(3, Math.round(deterministicGlyphs.length * level.density));
  const motionClass = reducedMotion ? 'is-reduced-motion' : '';

  if (profile.id === 'arcane-os') return null;

  return (
    <div
      className={`aesthetic-field ${motionClass}`}
      data-profile={profile.id}
      data-enchantment={level.id}
      data-presentation-authority="PROJECT_AUTHORED_PRESENTATION_PROFILE_NOT_SOURCE_FACT"
      aria-hidden="true"
    >
      <div className="aesthetic-field__halo aesthetic-field__halo--outer" />
      <div className="aesthetic-field__halo aesthetic-field__halo--inner" />
      <div className="aesthetic-field__seal">
        <span>✶</span><i /><span>☿</span><i /><span>☉</span><i /><span>☾</span>
      </div>
      <div className="aesthetic-field__axis" />

      <div className="aesthetic-field__glyphs">
        {deterministicGlyphs.slice(0, visibleGlyphs).map(entry => (
          <span
            key={entry.glyph}
            style={{ left: entry.left, top: entry.top, animationDelay: entry.delay }}
          >
            {entry.glyph}
          </span>
        ))}
      </div>

      <div className="aesthetic-field__motes">
        {deterministicMotes.slice(0, visibleMotes).map(entry => (
          <i
            key={entry.id}
            style={{
              left: entry.left,
              top: entry.top,
              width: `${entry.size}px`,
              height: `${entry.size}px`,
              animationDelay: entry.delay,
              animationDuration: entry.duration,
            }}
          />
        ))}
      </div>

      <div className="aesthetic-field__marginalia">
        {MARGINALIA.map((label, index) => <span key={label} data-index={index}>{label}</span>)}
      </div>
    </div>
  );
});
