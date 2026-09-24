/**
 * Every route this app serves or calls is under /v1. Fails when a tracked file
 * serves or calls a first-party /api path again.
 *
 * A path that starts right after a quote, backtick or paren is relative, so it
 * is ours; an absolute URL is ours when its host is. Third-party hosts
 * (api.github.com, a vendor's /api/stats) name a different host and do not
 * match. A route directory named api is a served /api prefix with no string to
 * find, so the tree is checked too.
 *
 *   node scripts/lint-paths.mjs
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const relative = /['"`(]\/api(\/|['"`)])/;
const ours = /\b(?:e?sign\.hanzo\.ai|localhost(?::\d+)?|127\.0\.0\.1(?::\d+)?)\/api\//;
const routeDir = /(^|\/)(routes\/api\+|app\/api)\//;
const text = /\.(c?js|mjs|ts|tsx|json|ya?ml|sh|mdx?|html|toml)$/;

const files = execFileSync('git', ['ls-files'], { encoding: 'utf8' }).split('\n').filter(Boolean);

const hits = [];

for (const file of files) {
  if (routeDir.test(file)) {
    hits.push(`${file}: serves /api from its directory`);
  }

  if (!text.test(file) || file.endsWith('package-lock.json')) {
    continue;
  }

  readFileSync(file, 'utf8')
    .split('\n')
    .forEach((line, i) => {
      if (relative.test(line) || ours.test(line)) {
        hits.push(`${file}:${i + 1}: ${line.trim()}`);
      }
    });
}

if (hits.length > 0) {
  console.error(`first-party /api paths (every route is /v1):\n${hits.join('\n')}`);
  process.exit(1);
}

console.log(`lint:paths: ${files.length} files, no first-party /api path`);
