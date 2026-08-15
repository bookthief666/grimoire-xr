import { access, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

export const QA_RUN_SCHEMA_VERSION = 1;
export const QA_STAGES = Object.freeze(['preview', 'final', 'refine']);

const runFile = directory => path.join(directory, 'run.json');

export const nextIncompleteStage = manifest => {
  const stages = manifest?.stages || {};
  return QA_STAGES.find(stage => !stages[stage]?.complete) || null;
};

export const isRunComplete = manifest => Boolean(
  manifest?.complete === true && nextIncompleteStage(manifest) === null,
);

export const createRunManifest = ({ baseUrl, seed, prompt, health, createdAt = new Date().toISOString() }) => ({
  schemaVersion: QA_RUN_SCHEMA_VERSION,
  createdAt,
  updatedAt: createdAt,
  complete: false,
  baseUrl,
  seed,
  prompt,
  health,
  stages: {
    preview: null,
    final: null,
    refine: null,
  },
});

export const markStageComplete = (manifest, stage, result, updatedAt = new Date().toISOString()) => {
  if (!QA_STAGES.includes(stage)) throw new Error(`Unknown QA stage: ${stage}`);
  return {
    ...manifest,
    updatedAt,
    stages: {
      ...(manifest?.stages || {}),
      [stage]: {
        complete: true,
        result,
      },
    },
  };
};

export const markRunComplete = (manifest, updatedAt = new Date().toISOString()) => ({
  ...manifest,
  complete: true,
  updatedAt,
});

export const saveRunManifest = async (directory, manifest) => {
  await mkdir(directory, { recursive: true });
  await writeFile(runFile(directory), `${JSON.stringify(manifest, null, 2)}\n`);
};

export const loadRunManifest = async directory => JSON.parse(await readFile(runFile(directory), 'utf8'));

export const assertStageArtifacts = async (directory, manifest) => {
  for (const stage of QA_STAGES) {
    if (!manifest?.stages?.[stage]?.complete) continue;
    await access(path.join(directory, `${stage}.png`));
  }
};

export const createRunDirectory = async (rootDirectory = path.resolve('qa-output'), now = new Date()) => {
  const stamp = now.toISOString().replace(/[:.]/g, '-');
  const directory = path.join(rootDirectory, `local-ai-${stamp}`);
  await mkdir(directory, { recursive: true });
  return directory;
};

export const findLatestIncompleteRun = async (rootDirectory = path.resolve('qa-output')) => {
  let entries;
  try {
    entries = await readdir(rootDirectory, { withFileTypes: true });
  } catch (error) {
    if (error?.code === 'ENOENT') return null;
    throw error;
  }

  const candidates = entries
    .filter(entry => entry.isDirectory() && entry.name.startsWith('local-ai-'))
    .map(entry => path.join(rootDirectory, entry.name))
    .sort()
    .reverse();

  for (const directory of candidates) {
    try {
      const manifest = await loadRunManifest(directory);
      if (!isRunComplete(manifest)) return { directory, manifest };
    } catch {
      // Ignore directories created by the older non-checkpointing harness.
    }
  }
  return null;
};
