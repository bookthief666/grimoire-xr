import React, { useMemo } from 'react';
import { buildRelicChamberModel } from './relicChamberModel.js';
import './reliquary.css';
import './oracleRelicOpen.css';

export default function RelicChamberField({ card, tradition, reducedMotion = false }) {
  const model = useMemo(() => buildRelicChamberModel({ card, tradition }), [card, tradition]);
  if (!model) return null;

  return (
    <div
      className={`relic-chamber-field ${reducedMotion ? 'is-reduced-motion' : ''}`}
      data-history-stage={model.historyStage.toLowerCase()}
      aria-hidden="true"
    >
      <div className="relic-chamber-veil" />
      <div className="relic-chamber-rings">
        {Array.from({ length: model.ringCount }, (_, index) => (
          <span key={index} className="relic-chamber-ring" style={{ '--ring-index': index }} />
        ))}
      </div>
      <div className="relic-chamber-axis" />
      <div className="relic-chamber-history-mark">{model.historyStage}</div>
      {model.inscriptions.length > 0 && (
        <div className="relic-chamber-inscriptions">
          {model.inscriptions.map((item, index) => (
            <div key={`${item.label}:${item.value}`} className="relic-chamber-inscription" style={{ '--inscription-index': index }}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
