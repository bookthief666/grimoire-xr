import React, { useMemo } from 'react';
import { buildThresholdSurfaceModel } from './enchantedSurfaceModel.js';

const glyphs = ['☿', '♀', '♄', '☉', '♃', '♂', '☽'];

export default function ThresholdRitualField({ hasQuestion = false, opening = false }) {
  const model = useMemo(() => buildThresholdSurfaceModel({ hasQuestion, opening }), [hasQuestion, opening]);

  return (
    <div
      className={`threshold-ritual-field is-${model.state}`}
      data-authority={model.authority}
      aria-hidden="true"
    >
      <svg className="threshold-seal" viewBox="0 0 600 600" role="presentation">
        <circle className="threshold-seal-ring ring-a" cx="300" cy="300" r="232" />
        <circle className="threshold-seal-ring ring-b" cx="300" cy="300" r="178" />
        <circle className="threshold-seal-ring ring-c" cx="300" cy="300" r="92" />
        <path className="threshold-seal-line" d="M300 68 L500 414 L100 414 Z" />
        <path className="threshold-seal-line is-reverse" d="M300 532 L100 186 L500 186 Z" />
        <path className="threshold-seal-axis" d="M300 40 V560 M40 300 H560" />
      </svg>

      <div className="threshold-glyph-orbit">
        {glyphs.map((glyph, index) => (
          <span key={glyph} className={`threshold-orbit-glyph glyph-${index + 1}`}>{glyph}</span>
        ))}
      </div>

      <div className="threshold-dormant-relics">
        {model.sigils.map((mark, index) => (
          <div key={`${mark}-${index}`} className={`threshold-dormant-relic relic-${index + 1}`}>
            <span className="threshold-relic-corner corner-a" />
            <span className="threshold-relic-corner corner-b" />
            <span className="threshold-relic-mark">{mark}</span>
            <span className="threshold-relic-index">{['I', 'II', 'III'][index]}</span>
          </div>
        ))}
      </div>

      <div className="threshold-opening-flare" />
    </div>
  );
}
