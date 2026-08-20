import fs from 'node:fs';

const fail = message => {
  console.error(`FAIL ${message}`);
  process.exitCode = 1;
};
const pass = message => console.log(`PASS ${message}`);

const semanticSource = fs.readFileSync('src/semantic/semanticConfig.js', 'utf8');
const panelSource = fs.readFileSync('src/semantic/SemanticConfigurationPanel.jsx', 'utf8');
const bridgeSource = fs.readFileSync('src/tarotBridge/canonicalTarotBridge.js', 'utf8');

if (semanticSource.includes('RELATION_METHOD_COMPATIBILITY') && semanticSource.includes('relationMethodSupportsTarotSystem')) pass('semantic config owns an explicit relation-method compatibility firewall');
else fail('semantic compatibility firewall missing');

if (panelSource.includes('NOT AUTHORIZED FOR THIS TAROT SYSTEM') && panelSource.includes('relationMethodSupportsTarotSystem')) pass('Reading Doctrine disables unsupported relation methods');
else fail('Reading Doctrine unsupported-method gate missing');

if (bridgeSource.includes('not authorized for Tarot system') && bridgeSource.includes('relationMethodSupportsTarotSystem')) pass('canonical bridge independently rejects unauthorized relation methods');
else fail('canonical bridge authorization firewall missing');

const {
  createSemanticConfig,
  relationMethodSupportsTarotSystem,
} = await import('../src/semantic/semanticConfig.js');
const { buildCanonicalTriadConsultation } = await import('../src/tarotBridge/canonicalTarotBridge.js');

const CROWLEY = 'crowley_lxxviii_dignities';
if (relationMethodSupportsTarotSystem(CROWLEY, 'thoth') && relationMethodSupportsTarotSystem(CROWLEY, 'rws') && !relationMethodSupportsTarotSystem(CROWLEY, 'marseille')) {
  pass('compatibility matrix matches authoritative VR registry: Thoth + RWS yes, Marseille no');
} else fail('relation compatibility matrix does not match VR authority');

const thoth = createSemanticConfig({ tarotSystem: 'thoth' });
const thothRecord = buildCanonicalTriadConsultation({
  readingId: 'phase-d1:thoth',
  question: 'authorization',
  legacyIndexes: [22, 50, 36],
  semanticConfig: thoth,
});
if (thothRecord.provenance.relationMethodAuthority === 'SOURCE_QUALIFIED_METHOD_INHERITANCE'
  && thothRecord.provenance.claimIds.includes('claim.thoth1944.divination.method-source.equinox-i-8')) {
  pass('Thoth retains inherited source-qualified Crowley/LXXVIII authority');
} else fail('Thoth relation authority changed');

const rws = createSemanticConfig({ tarotSystem: 'rws', relationMethod: CROWLEY });
const rwsRecord = buildCanonicalTriadConsultation({
  readingId: 'phase-d1:rws',
  question: 'authorization',
  legacyIndexes: [22, 50, 36],
  semanticConfig: rws,
});
if (rwsRecord.provenance.relationMethodAuthority === 'DIRECT_METHOD_SELECTION'
  && rwsRecord.provenance.sourceIds.includes('src.primary.crowley.liber-lxxviii')
  && !rwsRecord.provenance.claimIds.includes('claim.thoth1944.divination.method-source.equinox-i-8')) {
  pass('RWS retains explicit direct Crowley/LXXVIII selection without Thoth inheritance claim');
} else fail('RWS direct-method provenance changed');

const marseille = createSemanticConfig({ tarotSystem: 'marseille' });
const marseilleRecord = buildCanonicalTriadConsultation({
  readingId: 'phase-d1:marseille-disabled',
  question: 'authorization',
  legacyIndexes: [22, 50, 36],
  semanticConfig: marseille,
});
if (marseilleRecord.input.relationMethod === 'disabled' && marseilleRecord.relations.length === 0 && marseilleRecord.spreadPatterns.length === 0) {
  pass('fresh Marseille remains relation-disabled and binds no source-qualified relation doctrine');
} else fail('fresh Marseille relation behavior drifted');

let rejectedByConfig = false;
try {
  createSemanticConfig({ tarotSystem: 'marseille', relationMethod: CROWLEY });
} catch (error) {
  rejectedByConfig = /not compatible with tarotSystem=marseille/.test(String(error?.message || error));
}
if (rejectedByConfig) pass('semantic config rejects Marseille + Crowley/LXXVIII');
else fail('semantic config accepted Marseille + Crowley/LXXVIII');

let rejectedByBridgePath = false;
try {
  buildCanonicalTriadConsultation({
    readingId: 'phase-d1:marseille-bypass',
    question: 'authorization bypass',
    legacyIndexes: [22, 50, 36],
    semanticConfig: {
      schemaId: 'grimoire.semantic.config',
      schemaVersion: 1,
      tarotSystem: 'marseille',
      correspondenceProfile: 'none',
      relationMethod: CROWLEY,
      interpretiveLenses: [],
      ritualTheme: 'none',
      readingDepth: 'adept',
    },
  });
} catch (error) {
  rejectedByBridgePath = /not compatible with tarotSystem=marseille|not authorized for Tarot system marseille/.test(String(error?.message || error));
}
if (rejectedByBridgePath) pass('canonical consultation path fails closed on a forged Marseille + Crowley config');
else fail('canonical consultation path accepted forged Marseille + Crowley config');

if (!process.exitCode) console.log('0.48 Phase D1 relation authorization: PASS');
