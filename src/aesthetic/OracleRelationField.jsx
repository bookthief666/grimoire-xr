import React from 'react';

const X = [16.5, 50, 83.5];
const Y = 54;

const relationPath = ({ fromIndex, toIndex }) => {
  const x1 = X[fromIndex] ?? X[0];
  const x2 = X[toIndex] ?? X[X.length - 1];
  const midpoint = (x1 + x2) / 2;
  const lift = Math.max(10, 20 - Math.abs(x2 - x1) * 0.12);
  return `M ${x1} ${Y} Q ${midpoint} ${Y - lift} ${x2} ${Y}`;
};

export default function OracleRelationField({ surface }) {
  if (!surface) return null;

  return (
    <div
      className="oracle-relation-field"
      data-authority={surface.authority}
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" role="presentation">
        <circle className="oracle-spread-ring ring-a" cx="50" cy="52" r="38" />
        <circle className="oracle-spread-ring ring-b" cx="50" cy="52" r="26" />
        <path className="oracle-spread-axis" d="M8 54 H92" />

        {surface.relations.map((relation, index) => (
          <g key={relation.relationId} className={`oracle-current is-${relation.tone}`}>
            <path className="oracle-current-shadow" d={relationPath(relation)} />
            <path className="oracle-current-line" d={relationPath(relation)} style={{ '--relation-delay': `${index * 0.35}s` }} />
          </g>
        ))}

        {surface.outerTone && (
          <path
            className={`oracle-outer-current is-${surface.outerTone}`}
            d="M16.5 66 Q50 92 83.5 66"
          />
        )}

        {surface.centerApplied && (
          <g className="oracle-center-mark">
            <circle cx="50" cy="54" r="5.8" />
            <path d="M46 50 L54 58 M54 50 L46 58" />
          </g>
        )}
      </svg>
    </div>
  );
}
