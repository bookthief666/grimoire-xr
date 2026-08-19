import fs from 'node:fs';

const path = 'src/App.jsx';
const fail = message => { throw new Error(`0.47 Phase C preflight refused to edit: ${message}`); };
const replaceOnce = (source, before, after, label) => {
  const count = source.split(before).length - 1;
  if (count !== 1) fail(`${label} expected exactly one anchor, found ${count}`);
  return source.replace(before, after);
};

let app = fs.readFileSync(path, 'utf8');

const oldImagePrompt = `    const compiledPrompt = compileTarotImagePrompt({
      cardName: card.name,
      invocationSubject: state.author,
      traditionName: state.selectedTradition.name,`;
const newImagePrompt = `    const compiledPrompt = compileTarotImagePrompt({
      cardName: card.name,
      invocationSubject: state.author,
      traditionName: semanticSystemPresentationName(state.semanticConfig),`;

if (!app.includes(newImagePrompt)) {
  app = replaceOnce(app, oldImagePrompt, newImagePrompt, 'card image-prompt semantic system label');
}

const forgeDeps = '[state.author, state.selectedStyle, state.selectedTradition, state.erosLevel, state.techLevel]';
const semanticForgeDeps = '[state.author, state.selectedStyle, state.selectedTradition, state.semanticConfig, state.erosLevel, state.techLevel]';
const forgeDepCount = app.split(forgeDeps).length - 1;
if (forgeDepCount === 4) {
  app = app.split(forgeDeps).join(semanticForgeDeps);
} else if (forgeDepCount !== 0) {
  fail(`card-generation callback dependency anchors expected 4 or already-applied 0, found ${forgeDepCount}`);
}

const remainingSynthesisLabels = app.split('traditionName: state.selectedTradition.name,').length - 1;
if (remainingSynthesisLabels !== 2) {
  fail(`after image-prompt rebinding exactly 2 synthesis label anchors must remain, found ${remainingSynthesisLabels}`);
}

const thresholdPresentationAnchors = app.split('traditionName={state.selectedTradition.name}').length - 1;
if (thresholdPresentationAnchors !== 1) {
  fail(`Threshold semantic presentation anchor expected 1, found ${thresholdPresentationAnchors}`);
}

const relicTraditionAnchors = app.split('tradition={state.selectedTradition}').length - 1;
if (relicTraditionAnchors !== 3) {
  fail(`Relic authority semantic-system anchors expected 3, found ${relicTraditionAnchors}`);
}

if (!app.includes('<Brain size={12}/> INTELLECT')) {
  fail('legacy Intellect block anchor is missing before Phase C replacement');
}
if (!app.includes('>TRADITION</h3>')) {
  fail('legacy Tradition block anchor is missing before Phase C replacement');
}

fs.writeFileSync(path, app);
console.log('Applied 0.47 Phase C preflight: image prompt authority + semantic callback dependencies.');
