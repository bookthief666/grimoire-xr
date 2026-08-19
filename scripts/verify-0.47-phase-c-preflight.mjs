import fs from 'node:fs';

const app = fs.readFileSync('src/App.jsx', 'utf8');
const checks = [];
const expect = (condition, label) => {
  checks.push([Boolean(condition), label]);
  console.log(`${condition ? 'PASS' : 'FAIL'} ${label}`);
};

expect(
  app.includes(`    const compiledPrompt = compileTarotImagePrompt({\n      cardName: card.name,\n      invocationSubject: state.author,\n      traditionName: semanticSystemPresentationName(state.semanticConfig),`),
  'card image prompt uses semantic Tarot-system presentation',
);
expect(
  app.split('traditionName: state.selectedTradition.name,').length - 1 === 2,
  'exactly two canonical synthesis labels remain for Phase C activator',
);
expect(
  app.split('[state.author, state.selectedStyle, state.selectedTradition, state.semanticConfig, state.erosLevel, state.techLevel]').length - 1 === 4,
  'all four card-generation callbacks depend on semanticConfig',
);
expect(
  !app.includes('[state.author, state.selectedStyle, state.selectedTradition, state.erosLevel, state.techLevel]'),
  'legacy card-generation dependency arrays are absent',
);

if (checks.some(([ok]) => !ok)) process.exit(1);
console.log('0.47 Phase C preflight gate: PASS');
