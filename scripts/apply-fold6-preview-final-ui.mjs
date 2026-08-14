import { readFileSync, writeFileSync } from 'node:fs';

const path = new URL('../src/App.jsx', import.meta.url);
let source = readFileSync(path, 'utf8');

const block = lines => lines.join('\n');
const replaceOnce = (label, before, after) => {
  const matches = source.split(before).length - 1;
  if (matches !== 1) {
    throw new Error(`${label}: expected exactly one source match, found ${matches}. App.jsx was not written.`);
  }
  source = source.replace(before, after);
};

replaceOnce(
  'image helper import',
  block([
    "} from './grimoireCatalog.js';",
    '',
    '// ============================================================================',
  ]),
  block([
    "} from './grimoireCatalog.js';",
    "import { IMAGE_MODES, buildImageJobBody, canFinalizeCard, readImageGenerationResult } from './imageGeneration.js';",
    '',
    '// ============================================================================',
  ]),
);

replaceOnce(
  'image job client',
  block([
    'const fetchImagen = async (prompt) => {',
    '  return runGrimoireJob({',
    "    startPath: '/api/image/start',",
    "    statusPath: '/api/image/status',",
    '    body: { prompt },',
    '    pollMs: 4000,',
    '    readResult: result => {',
    "      if (!result.imageUrl) throw new Error('Image generation completed without an image.');",
    '      return result.imageUrl;',
    '    },',
    '  });',
    '};',
  ]),
  block([
    'const fetchImageGeneration = async (prompt, options = {}) => {',
    '  return runGrimoireJob({',
    "    startPath: '/api/image/start',",
    "    statusPath: '/api/image/status',",
    '    body: buildImageJobBody(prompt, options),',
    '    pollMs: 4000,',
    '    readResult: readImageGenerationResult,',
    '  });',
    '};',
    '',
    'const fetchImagen = async (prompt) => {',
    '  const result = await fetchImageGeneration(prompt);',
    '  return result.imageUrl;',
    '};',
  ]),
);

replaceOnce(
  'card generation',
  block([
    '  const generateCardData = async (card, setStatusCb = null) => {',
    '    const erosContext = getErosContext(state.erosLevel);',
    '    const erosPrompt = getErosPrompt(state.erosLevel);',
    '    const techContext = TECH_LEVELS[state.techLevel].instruction;',
    '    if (setStatusCb) setStatusCb("SCRIBING EXEGESIS...");',
    '    let data;',
    '    if (card.exegesis && card.meta) {',
    '        data = { exegesis: card.exegesis, meta: card.meta, visual: card.visual }; ',
    '    } else {',
    '        data = await fetchGemini(`Role: Grand Master of ${state.selectedTradition.name}. Task: Card interpretation for "${card.name}" linked to "${state.author}". Instructions: - Exegesis: 200-word analysis. - Meta: Hebrew Letter, Astrological Ruler, Alchemical Stage, Grimoire Spirit. - Visual: Description for art generation (${state.selectedStyle.name}). - TONE: ${techContext} ${erosContext} Return JSON: {"exegesis": "string", "meta": { "hebrew": "string", "planet": "string", "alchemical": "string", "daimon": "string", "gematria": number }, "visual": "string"}`);',
    '    }',
    '    const fullPrompt = `${state.selectedStyle.prompt} Tarot card "${card.name}". ${data.visual}. ${erosPrompt}. Masterpiece.`;',
    '    if (setStatusCb) setStatusCb("MANIFESTING IMAGE...");',
    '    // Do not auto-retry a local render. It may still be running after a tunnel',
    '    // interruption; the explicit retry action is the safe place to submit again.',
    '    const img = await fetchImagen(fullPrompt);',
    '    return { ...card, ...data, imageUrl: img, promptUsed: fullPrompt };',
    '  };',
  ]),
  block([
    '  const generateCardData = async (card, setStatusCb = null, imageOptions = {}) => {',
    '    const erosContext = getErosContext(state.erosLevel);',
    '    const erosPrompt = getErosPrompt(state.erosLevel);',
    '    const techContext = TECH_LEVELS[state.techLevel].instruction;',
    '    if (setStatusCb) setStatusCb(card.exegesis && card.meta ? "PREPARING IMAGE..." : "SCRIBING EXEGESIS...");',
    '    let data;',
    '    if (card.exegesis && card.meta) {',
    '        data = { exegesis: card.exegesis, meta: card.meta, visual: card.visual }; ',
    '    } else {',
    '        data = await fetchGemini(`Role: Grand Master of ${state.selectedTradition.name}. Task: Card interpretation for "${card.name}" linked to "${state.author}". Instructions: - Exegesis: 200-word analysis. - Meta: Hebrew Letter, Astrological Ruler, Alchemical Stage, Grimoire Spirit. - Visual: Description for art generation (${state.selectedStyle.name}). - TONE: ${techContext} ${erosContext} Return JSON: {"exegesis": "string", "meta": { "hebrew": "string", "planet": "string", "alchemical": "string", "daimon": "string", "gematria": number }, "visual": "string"}`);',
    '    }',
    '    const compiledPrompt = `${state.selectedStyle.prompt} Tarot card "${card.name}". ${data.visual}. ${erosPrompt}. Masterpiece.`;',
    '    const fullPrompt = imageOptions.prompt || card.promptUsed || compiledPrompt;',
    '    if (setStatusCb) setStatusCb(imageOptions.mode === IMAGE_MODES.final ? "FINALIZING IMAGE..." : "MANIFESTING PREVIEW...");',
    '    // Do not auto-retry a local render. It may still be running after a tunnel',
    '    // interruption; the explicit retry action is the safe place to submit again.',
    '    const rendered = await fetchImageGeneration(fullPrompt, imageOptions);',
    '    return {',
    '      ...card,',
    '      ...data,',
    '      imageUrl: rendered.imageUrl,',
    '      promptUsed: fullPrompt,',
    '      generation: rendered.generation,',
    '    };',
    '  };',
  ]),
);

replaceOnce(
  're-manifest handler',
  block([
    '  const handleRetryCard = useCallback(async (card) => {',
    "    dispatch({ type: 'FORGE_CARD_START', payload: card });",
    '    try {',
    "      const full = await generateCardData({ ...card, exegesis: null }, (msg) => dispatch({ type: 'SET_REFORGE_STATUS', payload: msg }));",
    '      forgeBuzz();',
    "      dispatch({ type: 'FORGE_CARD_SUCCESS', payload: full });",
    '    } catch (e) {',
    "      dispatch({ type: 'FORGE_CARD_FAILURE', payload: e.message });",
    "      dispatch({ type: 'SET_ERROR_MESSAGE', payload: `Re-Manifest Failed: ${e.message}` });",
    '    }',
    '  }, [state.author, state.selectedStyle, state.selectedTradition, state.erosLevel, state.techLevel]);',
  ]),
  block([
    '  const handleRetryCard = useCallback(async (card) => {',
    "    dispatch({ type: 'FORGE_CARD_START', payload: card });",
    '    try {',
    '      const full = await generateCardData(',
    '        card,',
    "        (msg) => dispatch({ type: 'SET_REFORGE_STATUS', payload: msg }),",
    "        { mode: IMAGE_MODES.preview, prompt: card.promptUsed || undefined },",
    '      );',
    '      forgeBuzz();',
    "      dispatch({ type: 'FORGE_CARD_SUCCESS', payload: full });",
    '    } catch (e) {',
    "      dispatch({ type: 'FORGE_CARD_FAILURE', payload: e.message });",
    "      dispatch({ type: 'SET_ERROR_MESSAGE', payload: `Re-Manifest Failed: ${e.message}` });",
    '    }',
    '  }, [state.author, state.selectedStyle, state.selectedTradition, state.erosLevel, state.techLevel]);',
    '',
    '  const handleFinalizeCard = useCallback(async (card) => {',
    '    if (!canFinalizeCard(card)) {',
    "      dispatch({ type: 'SET_ERROR_MESSAGE', payload: 'Re-manifest this card once to capture a reproducible preview seed before finalizing.' });",
    '      return;',
    '    }',
    "    dispatch({ type: 'FORGE_CARD_START', payload: card });",
    "    dispatch({ type: 'SET_REFORGE_STATUS', payload: 'FINALIZING IMAGE...' });",
    '    try {',
    '      const full = await generateCardData(',
    '        card,',
    "        (msg) => dispatch({ type: 'SET_REFORGE_STATUS', payload: msg }),",
    '        {',
    '          mode: IMAGE_MODES.final,',
    '          seed: card.generation.seed,',
    '          prompt: card.promptUsed,',
    '        },',
    '      );',
    '      forgeBuzz();',
    "      dispatch({ type: 'FORGE_CARD_SUCCESS', payload: full });",
    '    } catch (e) {',
    "      dispatch({ type: 'FORGE_CARD_FAILURE', payload: e.message });",
    "      dispatch({ type: 'SET_ERROR_MESSAGE', payload: `Finalize Failed: ${e.message}` });",
    '    }',
    '  }, [state.author, state.selectedStyle, state.selectedTradition, state.erosLevel, state.techLevel]);',
  ]),
);

replaceOnce(
  'busy overlay',
  '                  {state.isForging && !state.focusedCard.imageUrl && (',
  '                  {state.isForging && (',
);

replaceOnce(
  'focused card generation controls',
  block([
    '                <div className="flex-1 min-w-0">',
    '                  <div className="flex mb-8 justify-center md:justify-start">',
    '                     <button onClick={() => handleRetryCard(state.focusedCard)} className="flex items-center gap-2 px-4 py-2 border border-red-600 text-[10px] font-header hover:bg-red-600 hover:text-black transition-all text-red-600 disabled:opacity-50" disabled={state.isForging}>',
    '                        <RefreshCw size={12} className={state.isForging ? "animate-spin" : ""}/> RE-MANIFEST',
    '                     </button>',
    '                  </div>',
  ]),
  block([
    '                <div className="flex-1 min-w-0">',
    '                  <div className="mb-8 space-y-3">',
    '                    <div className="text-center md:text-left font-header text-[8px] sm:text-[9px] tracking-wider text-[#b8860b]/80">',
    '                      {state.focusedCard.generation ? (',
    '                        <>',
    '                          {state.focusedCard.generation.mode.toUpperCase()}',
    "                          {state.focusedCard.generation.width && state.focusedCard.generation.height ? ` · ${state.focusedCard.generation.width}×${state.focusedCard.generation.height}` : ''}",
    "                          {state.focusedCard.generation.steps ? ` · ${state.focusedCard.generation.steps} STEPS` : ''}",
    "                          {Number.isSafeInteger(state.focusedCard.generation.seed) ? ` · SEED ${state.focusedCard.generation.seed}` : ''}",
    '                        </>',
    '                      ) : (',
    '                        <>LEGACY MANIFESTATION · RE-MANIFEST TO CAPTURE SEED</>',
    '                      )}',
    '                    </div>',
    '                    <div className="flex flex-wrap gap-2 justify-center md:justify-start">',
    '                      <button onClick={() => handleRetryCard(state.focusedCard)} className="flex items-center gap-2 px-4 py-2 border border-red-600 text-[10px] font-header hover:bg-red-600 hover:text-black transition-all text-red-600 disabled:opacity-50" disabled={state.isForging}>',
    '                        <RefreshCw size={12} className={state.isForging ? "animate-spin" : ""}/> RE-MANIFEST PREVIEW',
    '                      </button>',
    '                      <button',
    '                        onClick={() => handleFinalizeCard(state.focusedCard)}',
    '                        className="flex items-center gap-2 px-4 py-2 border border-[#b8860b] text-[10px] font-header hover:bg-[#b8860b] hover:text-black transition-all text-[#e5c158] disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[#e5c158]"',
    '                        disabled={state.isForging || !canFinalizeCard(state.focusedCard)}',
    '                      >',
    '                        <Check size={12}/> FINALIZE',
    '                      </button>',
    '                    </div>',
    '                  </div>',
  ]),
);

writeFileSync(path, source);
console.log('Patched src/App.jsx with preview/final generation metadata and controls.');
