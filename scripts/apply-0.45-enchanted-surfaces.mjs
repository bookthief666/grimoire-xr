import fs from 'node:fs';
import path from 'node:path';

const fail = message => { throw new Error(`0.45 enchanted surfaces activator refused to edit: ${message}`); };
const replaceOnce = (source, before, after, label) => {
  if (source.includes(after)) return source;
  const first = source.indexOf(before);
  if (first < 0) fail(`${label} anchor not found`);
  if (source.indexOf(before, first + before.length) >= 0) fail(`${label} anchor ambiguous`);
  return source.replace(before, after);
};

const thresholdPath = path.join(process.cwd(), 'src/ThresholdLanding.jsx');
let threshold = fs.readFileSync(thresholdPath, 'utf8');

threshold = replaceOnce(
  threshold,
  "import React from 'react';\nimport { BookOpen, ChevronDown, Download, Sparkles } from 'lucide-react';",
  "import React, { useState } from 'react';\nimport { BookOpen, ChevronDown, Download, Sparkles } from 'lucide-react';\nimport ThresholdRitualField from './aesthetic/ThresholdRitualField.jsx';\nimport './aesthetic/enchantedSurfaces.css';",
  'Threshold imports',
);

threshold = replaceOnce(
  threshold,
  "  const canDraw = Boolean(String(question || '').trim());\n  const canInitiateStudio = Boolean(String(subject || '').trim());\n\n  return (",
  "  const canDraw = Boolean(String(question || '').trim());\n  const canInitiateStudio = Boolean(String(subject || '').trim());\n  const [isOpening, setIsOpening] = useState(false);\n\n  const handleDraw = () => {\n    if (!canDraw || isOpening) return;\n    setIsOpening(true);\n    window.setTimeout(() => onDraw?.(), 520);\n  };\n\n  return (",
  'Threshold opening state',
);

threshold = replaceOnce(
  threshold,
  "    <main className=\"min-h-[100dvh] pt-[calc(6.5rem+env(safe-area-inset-top))] pr-[max(1.25rem,env(safe-area-inset-right))] pb-[max(2rem,env(safe-area-inset-bottom))] pl-[max(1.25rem,env(safe-area-inset-left))] flex items-center justify-center z-10 relative flex-1\">\n      <section className=\"w-full max-w-3xl mx-auto text-[#e9dfc7]\">",
  "    <main className=\"threshold-surface min-h-[100dvh] pt-[calc(6.5rem+env(safe-area-inset-top))] pr-[max(1.25rem,env(safe-area-inset-right))] pb-[max(2rem,env(safe-area-inset-bottom))] pl-[max(1.25rem,env(safe-area-inset-left))] flex items-center justify-center z-10 relative flex-1\">\n      <ThresholdRitualField hasQuestion={canDraw} opening={isOpening} />\n      <section className=\"relative z-[1] w-full max-w-3xl mx-auto text-[#e9dfc7]\">",
  'Threshold ritual field mount',
);

threshold = replaceOnce(
  threshold,
  "        <div className=\"border-y border-[#8b6a2b]/45 bg-[#090806]/88 px-4 py-5 sm:px-8 sm:py-7 shadow-[0_22px_70px_rgba(0,0,0,0.35)]\">",
  "        <div className=\"threshold-inscription-panel border-y border-[#8b6a2b]/45 bg-[#090806]/88 px-4 py-5 sm:px-8 sm:py-7 shadow-[0_22px_70px_rgba(0,0,0,0.35)]\">",
  'Threshold inscription panel class',
);

threshold = replaceOnce(
  threshold,
  "            className=\"native-text-input w-full min-h-[150px] sm:min-h-[180px] resize-y bg-transparent border border-[#8b6a2b]/35 px-4 py-4 text-xl sm:text-2xl leading-relaxed text-[#f0e7d3] placeholder:text-[#8b806b]/45 focus:outline-none focus:border-[#c29c47]/70\"",
  "            className=\"threshold-question-input native-text-input w-full min-h-[150px] sm:min-h-[180px] resize-y bg-transparent border border-[#8b6a2b]/35 px-4 py-4 text-xl sm:text-2xl leading-relaxed text-[#f0e7d3] placeholder:text-[#8b806b]/45 focus:outline-none focus:border-[#c29c47]/70\"",
  'Threshold question input class',
);

threshold = replaceOnce(
  threshold,
  "            onClick={onDraw}\n            disabled={!canDraw}\n            className=\"mt-5 min-h-14 w-full flex items-center justify-center gap-3 border border-[#b8860b]/75 bg-[#b8860b]/10 px-5 py-4 font-header text-[10px] sm:text-xs tracking-[0.14em] text-[#e5c158] transition-colors hover:bg-[#b8860b] hover:text-black disabled:opacity-30 disabled:cursor-not-allowed\"\n          >\n            <Sparkles size={16} /> DRAW THREE",
  "            onClick={handleDraw}\n            disabled={!canDraw || isOpening}\n            className={`threshold-draw-button ${isOpening ? 'is-opening' : ''} mt-5 min-h-14 w-full flex items-center justify-center gap-3 border border-[#b8860b]/75 bg-[#b8860b]/10 px-5 py-4 font-header text-[10px] sm:text-xs tracking-[0.14em] text-[#e5c158] transition-colors hover:bg-[#b8860b] hover:text-black disabled:opacity-30 disabled:cursor-not-allowed`}\n          >\n            <Sparkles size={16} /> {isOpening ? 'OPENING THE THREE…' : 'DRAW THREE'}",
  'Threshold ceremonial draw',
);

fs.writeFileSync(thresholdPath, threshold);

const oraclePath = path.join(process.cwd(), 'src/tarotBridge/OracleLivingBook.jsx');
let oracle = fs.readFileSync(oraclePath, 'utf8');

oracle = replaceOnce(
  oracle,
  "import { buildOracleBookPresentation } from './oracleBookPresentation.js';",
  "import { buildOracleBookPresentation } from './oracleBookPresentation.js';\nimport OracleRelationField from '../aesthetic/OracleRelationField.jsx';\nimport { buildOracleSurfaceModel } from '../aesthetic/enchantedSurfaceModel.js';\nimport '../aesthetic/enchantedSurfaces.css';",
  'Oracle enchanted imports',
);

oracle = replaceOnce(
  oracle,
  "const PositionCard = ({ position, ordinal }) => (\n  <article className=\"min-w-0\">\n    <div className=\"mb-3 text-center\">",
  "const PositionCard = ({ position, ordinal, surfacePosition }) => (\n  <article className=\"oracle-position-card min-w-0\">\n    <div className=\"oracle-position-seal\"><span>{surfacePosition?.mark || '✦'}</span></div>\n    <div className=\"mb-3 text-center\">",
  'Oracle position seal',
);

oracle = replaceOnce(
  oracle,
  "    <div className=\"relative aspect-[2/3.35] overflow-hidden border border-[#9c7a32]/70 bg-[#080705] shadow-[0_16px_45px_rgba(0,0,0,0.55)]\">",
  "    <div className=\"oracle-relic-frame relative aspect-[2/3.35] overflow-hidden border border-[#9c7a32]/70 bg-[#080705] shadow-[0_16px_45px_rgba(0,0,0,0.55)]\">",
  'Oracle relic frame class',
);

oracle = replaceOnce(
  oracle,
  "        <div className=\"absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_center,rgba(184,134,11,0.16),transparent_58%)]\">",
  "        <div className=\"oracle-unmanifested-mark absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_center,rgba(184,134,11,0.16),transparent_58%)]\">",
  'Oracle unmanifested mark class',
);

oracle = replaceOnce(
  oracle,
  "  <div className={`border-l px-4 py-4 sm:px-5 ${toneClass(relation.tone)}` }>",
  "  <div className={`oracle-relation-note is-${relation.tone} border-l px-4 py-4 sm:px-5 ${toneClass(relation.tone)}` }>",
  'Oracle relation note class',
);

oracle = replaceOnce(
  oracle,
  "  const model = useMemo(() => buildOracleBookPresentation(reading), [reading]);\n\n  if (!model.hasCanonicalRecord)",
  "  const model = useMemo(() => buildOracleBookPresentation(reading), [reading]);\n  const surfaceModel = useMemo(() => buildOracleSurfaceModel(model), [model]);\n\n  if (!model.hasCanonicalRecord)",
  'Oracle surface model',
);

oracle = replaceOnce(
  oracle,
  "    <section className=\"w-full max-w-5xl mx-auto pb-32 text-[#e8dfca]\">",
  "    <section className=\"oracle-enchanted-surface w-full max-w-5xl mx-auto pb-32 text-[#e8dfca]\">",
  'Oracle enchanted surface root',
);

oracle = replaceOnce(
  oracle,
  "      <div className=\"grid grid-cols-3 gap-3 sm:gap-6 lg:gap-8 items-start mb-10 sm:mb-14\">\n        {model.positions.map((position, index) => <PositionCard key={position.positionId} position={position} ordinal={index} />)}\n      </div>",
  "      <div className=\"oracle-spread-stage\">\n        <OracleRelationField surface={surfaceModel} />\n        <div className=\"oracle-card-grid grid grid-cols-3 gap-3 sm:gap-6 lg:gap-8 items-start\">\n          {model.positions.map((position, index) => <PositionCard key={position.positionId} position={position} ordinal={index} surfacePosition={surfaceModel.positions[index]} />)}\n        </div>\n      </div>",
  'Oracle spread relation field',
);

oracle = replaceOnce(
  oracle,
  "      <article className=\"relative border-y border-[#8b6a2b]/45 bg-[#090806]/90 px-5 py-7 sm:px-10 sm:py-9 shadow-[0_18px_60px_rgba(0,0,0,0.28)]\">\n        <div className=\"flex flex-wrap items-center justify-between gap-4 mb-5\">\n          <div>\n            <div className=\"font-header text-[8px] sm:text-[9px] tracking-[0.18em] text-[#d6b45b]\">THE WITNESS</div>",
  "      <article className=\"oracle-witness-folio relative border-y border-[#8b6a2b]/45 bg-[#090806]/90 px-5 py-7 sm:px-10 sm:py-9 shadow-[0_18px_60px_rgba(0,0,0,0.28)]\">\n        <div className=\"flex flex-wrap items-center justify-between gap-4 mb-5\">\n          <div className=\"flex items-center gap-3\">\n            <div className=\"oracle-witness-seal\">✦</div>\n            <div>\n            <div className=\"font-header text-[8px] sm:text-[9px] tracking-[0.18em] text-[#d6b45b]\">THE WITNESS</div>",
  'Oracle witness folio opening',
);

oracle = replaceOnce(
  oracle,
  "            <div className=\"mt-1 text-[12px] sm:text-[13px] text-[#9e8d62]\">Derived from the recorded relations · no model invoked</div>\n          </div>\n          <button",
  "            <div className=\"mt-1 text-[12px] sm:text-[13px] text-[#9e8d62]\">Derived from the recorded relations · no model invoked</div>\n            </div>\n          </div>\n          <button",
  'Oracle witness folio closing',
);

oracle = replaceOnce(
  oracle,
  "          <div className=\"mt-6 border border-[#8b6a2b]/30 bg-[#0b0906]/75 p-5 sm:p-6\">",
  "          <div className=\"oracle-wider-pattern mt-6 border border-[#8b6a2b]/30 bg-[#0b0906]/75 p-5 sm:p-6\">",
  'Oracle wider pattern class',
);

for (const [source, markers] of [[threshold, [
  'threshold-surface',
  '<ThresholdRitualField',
  'threshold-inscription-panel',
  'OPENING THE THREE…',
]], [oracle, [
  'oracle-enchanted-surface',
  '<OracleRelationField',
  'oracle-witness-folio',
  'oracle-position-seal',
]]]) {
  for (const marker of markers) if (!source.includes(marker)) fail(`required runtime marker missing: ${marker}`);
}

fs.writeFileSync(oraclePath, oracle);
console.log('Applied 0.45 Enchanted Threshold + Oracle surfaces.');
