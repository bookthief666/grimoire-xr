import fs from 'node:fs';
import path from 'node:path';

const threshold = fs.readFileSync(path.join(process.cwd(), 'src/ThresholdLanding.jsx'), 'utf8');
const oracle = fs.readFileSync(path.join(process.cwd(), 'src/tarotBridge/OracleLivingBook.jsx'), 'utf8');

const requireText = (source, text, label) => {
  if (!source.includes(text)) throw new Error(`0.45 enchanted surfaces gate failed: ${label}`);
};
const forbidText = (source, text, label) => {
  if (source.includes(text)) throw new Error(`0.45 enchanted surfaces gate failed: ${label}`);
};

for (const [text, label] of [
  ["import ThresholdRitualField from './aesthetic/ThresholdRitualField.jsx';", 'Threshold field import missing'],
  ['<ThresholdRitualField hasQuestion={canDraw} opening={isOpening} />', 'Threshold field mount missing'],
  ["window.setTimeout(() => onDraw?.(), 520);", 'ceremonial draw delay missing'],
  ["OPENING THE THREE…", 'opening state label missing'],
  ['threshold-inscription-panel', 'Threshold inscription panel missing'],
]) requireText(threshold, text, label);

for (const [text, label] of [
  ["import OracleRelationField from '../aesthetic/OracleRelationField.jsx';", 'Oracle relation field import missing'],
  ['const surfaceModel = useMemo(() => buildOracleSurfaceModel(model), [model]);', 'Oracle surface projection missing'],
  ['<OracleRelationField surface={surfaceModel} />', 'Oracle current field mount missing'],
  ['surfacePosition={surfaceModel.positions[index]}', 'position seal projection missing'],
  ['oracle-witness-folio', 'Witness folio treatment missing'],
  ['oracle-wider-pattern', 'Wider Pattern treatment missing'],
]) requireText(oracle, text, label);

forbidText(threshold, 'prepareCanonicalOracleConsultation', 'Threshold must not compute Tarot relations');
forbidText(oracle, 'buildCanonicalDeckGenesis', 'Living Book presentation must not construct deck semantics');

console.log('0.45 enchanted surfaces integration gate: PASS');
