#!/usr/bin/env node
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { LOCATION_ID, PIPELINE_ID } from './hqc-weekly-report.mjs';

export async function captureSnapshot({ request, now = new Date().toISOString() }) {
  const result = await request(`/opportunities/search?location_id=${LOCATION_ID}&limit=100`, { method: 'GET' });
  if (!Array.isArray(result?.opportunities) || !Number.isInteger(result.meta?.total)) {
    throw new Error('Provider opportunity inventory or total is unavailable.');
  }
  const rows = result.opportunities;
  if (rows.length >= 100 || rows.length !== result.meta.total) {
    throw new Error('Inventory exceeds this bounded exporter or pagination is incomplete.');
  }
  const ids = new Set();
  for (const row of rows) {
    if (!row?.id || !row.pipelineId || row.locationId !== LOCATION_ID || ids.has(row.id)) {
      throw new Error('Provider opportunity identity is missing, duplicated or outside HQC.');
    }
    ids.add(row.id);
  }
  return {
    capturedAt: now,
    locationId: LOCATION_ID,
    pipelineId: PIPELINE_ID,
    coverage: { currentInventoryComplete: true, opportunitiesComplete: false, eventsComplete: false },
    coverageNotes: [
      'Complete current provider inventory at capture time, not proof of deleted historical records.',
      'Receipt, human-response, quote and outcome events have not been exported. Their metrics remain unavailable.',
    ],
    opportunities: rows,
    events: [],
  };
}

export async function main(argv = process.argv.slice(2)) {
  if (argv.length === 1 && argv[0] === '--help') {
    process.stdout.write('Usage: node scripts/hqc-weekly-export.mjs --provider /private/provider.cjs --output /private/snapshot.json\n');
    return;
  }
  const options = {};
  for (let i = 0; i < argv.length; i += 2) {
    const key = argv[i]?.replace(/^--/, '');
    if (!['provider', 'output'].includes(key) || argv[i] !== `--${key}` || !argv[i + 1] || argv[i + 1].startsWith('--') || options[key]) {
      throw new Error('Expected --provider and --output exactly once; use --help.');
    }
    options[key] = argv[i + 1];
  }
  if (!options.provider || !options.output) throw new Error('Both --provider and --output are required.');
  const provider = await import(pathToFileURL(resolve(options.provider)).href);
  const connect = provider.connect ?? provider.default?.connect;
  if (typeof connect !== 'function') throw new Error('Existing private provider module must export connect().');
  const request = await connect();
  if (typeof request !== 'function') throw new Error('Provider connect() must return the authenticated request function.');
  const snapshot = await captureSnapshot({ request });
  await writeFile(resolve(options.output), JSON.stringify(snapshot, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
  process.stdout.write(`Read-only snapshot saved (${snapshot.opportunities.length} current opportunities; event coverage incomplete).\n`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch(error => {
    process.stderr.write(`HQC weekly export: ${error.code ? `file operation failed (${error.code})` : error.message}\n`);
    process.exitCode = 1;
  });
}
