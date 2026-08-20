import fs from 'node:fs';

const read = path => fs.readFileSync(path, 'utf8');
const write = (path, value) => fs.writeFileSync(path, value, 'utf8');

const replaceOnce = (source, before, after, label) => {
  const count = source.split(before).length - 1;
  if (count !== 1) throw new Error(`${label}: expected exactly one anchor, found ${count}`);
  return source.replace(before, after);
};

const semanticPath = 'src/semantic/semanticConfig.js';
let semantic = read(semanticPath);
if (semantic.includes('RELATION_METHOD_COMPATIBILITY')) {
  throw new Error('Phase D1 semantic authorization appears already activated.');
}
semantic = replaceOnce(
  semantic,
  "export const RELATION_METHODS = Object.freeze(['crowley_lxxviii_dignities', 'disabled']);\n",
  "export const RELATION_METHODS = Object.freeze(['crowley_lxxviii_dignities', 'disabled']);\nexport const RELATION_METHOD_COMPATIBILITY = Object.freeze({\n  disabled: Object.freeze(['thoth', 'rws', 'marseille']),\n  crowley_lxxviii_dignities: Object.freeze(['thoth', 'rws']),\n});\n",
  'semantic compatibility registry',
);
semantic = replaceOnce(
  semantic,
  "const asId = value => String(value || '').trim().toLowerCase();\n",
  "const asId = value => String(value || '').trim().toLowerCase();\nexport const relationMethodSupportsTarotSystem = (relationMethod, tarotSystem) => (\n  RELATION_METHOD_COMPATIBILITY[asId(relationMethod)]?.includes(asId(tarotSystem)) === true\n);\n",
  'semantic compatibility helper',
);
semantic = replaceOnce(
  semantic,
  "  if (!RELATION_METHODS.includes(config.relationMethod)) errors.push(`unsupported relationMethod: ${String(config.relationMethod)}`);\n",
  "  if (!RELATION_METHODS.includes(config.relationMethod)) errors.push(`unsupported relationMethod: ${String(config.relationMethod)}`);\n  if (RELATION_METHODS.includes(config.relationMethod) && TAROT_SYSTEMS.includes(config.tarotSystem)\n    && !relationMethodSupportsTarotSystem(config.relationMethod, config.tarotSystem)) {\n    errors.push(`relationMethod ${config.relationMethod} is not compatible with tarotSystem=${config.tarotSystem}`);\n  }\n",
  'semantic validation firewall',
);
write(semanticPath, semantic);

const panelPath = 'src/semantic/SemanticConfigurationPanel.jsx';
let panel = read(panelPath);
if (panel.includes('RELATION METHOD UNAVAILABLE FOR')) {
  throw new Error('Phase D1 doctrine UI appears already activated.');
}
panel = replaceOnce(
  panel,
  "import { semanticSystemPresentationName } from './semanticRuntimeAdapter.js';\n",
  "import { semanticSystemPresentationName } from './semanticRuntimeAdapter.js';\nimport { relationMethodSupportsTarotSystem } from './semanticConfig.js';\n",
  'panel compatibility import',
);
panel = replaceOnce(
  panel,
  "          {RELATIONS.map(method => (\n            <button\n              key={method.id}\n              type=\"button\"\n              disabled={disabled}\n              onClick={() => onPatch?.({ relationMethod: method.id })}\n              className={`${smallButton(config.relationMethod === method.id)} text-left disabled:opacity-40`}\n            >\n              {method.label}\n            </button>\n          ))}\n",
  "          {RELATIONS.map(method => {\n            const methodSupported = relationMethodSupportsTarotSystem(method.id, config.tarotSystem);\n            return (\n              <button\n                key={method.id}\n                type=\"button\"\n                disabled={disabled || !methodSupported}\n                title={!methodSupported ? `RELATION METHOD UNAVAILABLE FOR ${semanticSystemPresentationName(config)}` : undefined}\n                onClick={() => onPatch?.({ relationMethod: method.id })}\n                className={`${smallButton(config.relationMethod === method.id)} text-left disabled:opacity-35 disabled:cursor-not-allowed`}\n              >\n                <span className=\"block\">{method.label}</span>\n                {!methodSupported ? (\n                  <span className=\"block mt-2 font-mono text-[8px] text-red-400/70\">NOT AUTHORIZED FOR THIS TAROT SYSTEM</span>\n                ) : null}\n              </button>\n            );\n          })}\n",
  'panel relation method gate',
);
write(panelPath, panel);

const bridgePath = 'src/tarotBridge/canonicalTarotBridge.js';
let bridge = read(bridgePath);
if (bridge.includes('not authorized for Tarot system')) {
  throw new Error('Phase D1 bridge authorization appears already activated.');
}
bridge = replaceOnce(
  bridge,
  "import { resolveSemanticBridgeConfig, semanticBridgeConfigFromReadingRecord } from '../semantic/semanticBridgeConfig.js';\n",
  "import { resolveSemanticBridgeConfig, semanticBridgeConfigFromReadingRecord } from '../semantic/semanticBridgeConfig.js';\nimport { relationMethodSupportsTarotSystem } from '../semantic/semanticConfig.js';\n",
  'bridge compatibility import',
);
bridge = replaceOnce(
  bridge,
  "  if (interpretation.relationMethod === 'disabled') return deepFreeze(baseRecord);\n  if (interpretation.relationMethod !== 'crowley_lxxviii_dignities') {\n",
  "  if (interpretation.relationMethod === 'disabled') return deepFreeze(baseRecord);\n  if (!relationMethodSupportsTarotSystem(interpretation.relationMethod, interpretation.tarotSystem)) {\n    throw new Error(`Relation method ${interpretation.relationMethod} is not authorized for Tarot system ${interpretation.tarotSystem}`);\n  }\n  if (interpretation.relationMethod !== 'crowley_lxxviii_dignities') {\n",
  'bridge relation authorization firewall',
);
write(bridgePath, bridge);

console.log('0.48 Phase D1 relation authorization activated.');
