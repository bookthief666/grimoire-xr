import { readFileSync, writeFileSync } from 'node:fs';

const appPath = new URL('../src/App.jsx', import.meta.url);
const serverPath = new URL('../server/index.mjs', import.meta.url);
let appSource = readFileSync(appPath, 'utf8');
let serverSource = readFileSync(serverPath, 'utf8');

const block = lines => lines.join('\n');
const replaceOnce = (label, source, before, after) => {
  const matches = source.split(before).length - 1;
  if (matches !== 1) {
    throw new Error(`${label}: expected exactly one source match, found ${matches}. No files were written.`);
  }
  return source.replace(before, after);
};

appSource = replaceOnce(
  'client helper imports',
  appSource,
  block([
    "import { IMAGE_MODES, buildImageJobBody, canFinalizeCard, canRefineCard, readImageGenerationResult } from './imageGeneration.js';",
    '',
  ]),
  block([
    "import { IMAGE_MODES, buildImageJobBody, canFinalizeCard, canRefineCard, readImageGenerationResult } from './imageGeneration.js';",
    "import { createGrimoireApiError, isTerminalJobPollError, jobInterruptedMessage, jobKindFromStatusPath } from './jobPolling.js';",
    "import { TAROT_PROMPT_SCHEMA, compileTarotImagePrompt } from './tarotPrompt.js';",
    '',
  ]),
);

appSource = replaceOnce(
  'API error status propagation',
  appSource,
  block([
    '  const payload = await response.json().catch(() => ({}));',
    '  if (!response.ok) {',
    '    throw new Error(payload.error || `Grimoire API failed (${response.status})`);',
    '  }',
  ]),
  block([
    '  const payload = await response.json().catch(() => ({}));',
    '  if (!response.ok) {',
    '    throw createGrimoireApiError({ payload, status: response.status });',
    '  }',
  ]),
);

appSource = replaceOnce(
  'terminal missing-job polling policy',
  appSource,
  block([
    '    } catch (error) {',
    '      consecutivePollFailures += 1;',
    '      if (consecutivePollFailures >= 5) throw error;',
    '      continue;',
    '    }',
  ]),
  block([
    '    } catch (error) {',
    '      if (isTerminalJobPollError(error)) {',
    '        const interrupted = Object.assign(',
    '          new Error(jobInterruptedMessage(jobKindFromStatusPath(statusPath))),',
    "          { status: error.status, code: error.code || 'JOB_MISSING' },",
    '        );',
    '        throw interrupted;',
    '      }',
    '      consecutivePollFailures += 1;',
    '      if (consecutivePollFailures >= 5) throw error;',
    '      continue;',
    '    }',
  ]),
);

appSource = replaceOnce(
  'structured card prompt compiler',
  appSource,
  '    const compiledPrompt = `${state.selectedStyle.prompt} Tarot card "${card.name}". ${data.visual}. ${erosPrompt}. Masterpiece.`;',
  block([
    '    const compiledPrompt = compileTarotImagePrompt({',
    '      cardName: card.name,',
    '      invocationSubject: state.author,',
    '      traditionName: state.selectedTradition.name,',
    '      styleName: state.selectedStyle.name,',
    '      stylePrompt: state.selectedStyle.prompt,',
    '      visual: data.visual,',
    '      erosPrompt,',
    '      meta: data.meta,',
    '    });',
  ]),
);

appSource = replaceOnce(
  'prompt schema provenance',
  appSource,
  block([
    '    const fullPrompt = imageOptions.prompt || card.promptUsed || compiledPrompt;',
    '    if (setStatusCb) setStatusCb(imageOptions.mode === IMAGE_MODES.refine ? "REFINING IMAGE..." : imageOptions.mode === IMAGE_MODES.final ? "FINALIZING IMAGE..." : "MANIFESTING PREVIEW...");',
  ]),
  block([
    '    const hasStoredPrompt = Boolean(imageOptions.prompt || card.promptUsed);',
    '    const fullPrompt = imageOptions.prompt || card.promptUsed || compiledPrompt;',
    "    const promptSchema = hasStoredPrompt ? (card.promptSchema || 'legacy-flat-v1') : TAROT_PROMPT_SCHEMA;",
    '    if (setStatusCb) setStatusCb(imageOptions.mode === IMAGE_MODES.refine ? "REFINING IMAGE..." : imageOptions.mode === IMAGE_MODES.final ? "FINALIZING IMAGE..." : "MANIFESTING PREVIEW...");',
  ]),
);

appSource = replaceOnce(
  'persist prompt schema',
  appSource,
  block([
    '      imageUrl: rendered.imageUrl,',
    '      promptUsed: fullPrompt,',
    '      generation: rendered.generation,',
  ]),
  block([
    '      imageUrl: rendered.imageUrl,',
    '      promptUsed: fullPrompt,',
    '      promptSchema,',
    '      generation: rendered.generation,',
  ]),
);

serverSource = replaceOnce(
  'server job error import',
  serverSource,
  block([
    "import { normalizeImageJobRequest } from './image-request.mjs';",
    "import { createOllamaClient, createOllamaConfig } from './ollama.mjs';",
  ]),
  block([
    "import { normalizeImageJobRequest } from './image-request.mjs';",
    "import { createMissingJobError, serializeApiError } from './job-errors.mjs';",
    "import { createOllamaClient, createOllamaConfig } from './ollama.mjs';",
  ]),
);

serverSource = replaceOnce(
  'text missing-job code',
  serverSource,
  "  if (!job) throw Object.assign(new Error('Text job was not found or has expired.'), { status: 404 });",
  "  if (!job) throw createMissingJobError('Text');",
);

serverSource = replaceOnce(
  'image missing-job code',
  serverSource,
  "  if (!job) throw Object.assign(new Error('Image job was not found or has expired.'), { status: 404 });",
  "  if (!job) throw createMissingJobError('Image');",
);

serverSource = replaceOnce(
  'server error serialization',
  serverSource,
  block([
    '  } catch (error) {',
    '    const status = Number(error.status) || 500;',
    "    console.error(`${request.method} ${request.url} failed (${status}): ${error.message || 'Unexpected server error.'}`);",
    "    return sendJson(response, status, { error: error.message || 'Unexpected server error.' }, origin);",
    '  }',
  ]),
  block([
    '  } catch (error) {',
    '    const { status, payload } = serializeApiError(error);',
    "    console.error(`${request.method} ${request.url} failed (${status}): ${payload.error}`);",
    '    return sendJson(response, status, payload, origin);',
    '  }',
  ]),
);

writeFileSync(appPath, appSource);
writeFileSync(serverPath, serverSource);
console.log('Patched src/App.jsx and server/index.mjs with terminal 404 recovery and structured Tarot prompts.');
