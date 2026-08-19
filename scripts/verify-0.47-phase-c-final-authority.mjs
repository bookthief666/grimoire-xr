import fs from 'node:fs';

const app = fs.readFileSync('src/App.jsx', 'utf8');
const checks = [];
const expect = (condition, label) => {
  checks.push([Boolean(condition), label]);
  console.log(`${condition ? 'PASS' : 'FAIL'} ${label}`);
};

expect(!app.includes('traditionName: state.selectedTradition.name,'), 'no runtime prompt labels derive semantic authority from selectedTradition');
expect(
  app.split('traditionName: semanticSystemPresentationName(state.semanticConfig),').length - 1 === 3,
  'both synthesis prompts and card image prompt use semantic Tarot-system presentation',
);
expect(
  app.split('[state.author, state.selectedStyle, state.selectedTradition, state.semanticConfig, state.erosLevel, state.techLevel]').length - 1 === 4,
  'all card generation callbacks react to lens/config changes',
);
expect(app.includes("case 'PATCH_SEMANTIC_CONFIG':"), 'semantic patch reducer action is active');
expect(app.includes('<SemanticConfigurationPanel'), 'Reading Doctrine panel is active');
expect(!app.includes('>TRADITION</h3>'), 'legacy Tradition control is absent');
expect(!app.includes('<Brain size={12}/> INTELLECT'), 'legacy Intellect control is absent');

if (checks.some(([ok]) => !ok)) process.exit(1);
console.log('0.47 Phase C final authority gate: PASS');
