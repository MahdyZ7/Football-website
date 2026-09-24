// cfg.buildCmd: everything the converter needs before it runs.
//  1. Tailwind CSS  -> .cache/ds.css            (build-css.mjs)
//  2. Declarations  -> .cache/types/index.d.ts  (tsc, for the <Name>Props contracts)
// Type errors in app code don't block emit (noEmitOnError: false); they're printed only.
import { execFileSync } from 'node:child_process';
import { writeFileSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
execFileSync(process.execPath, [join(here, 'build-css.mjs')], { stdio: 'inherit' });
rmSync(join(here, '.cache', 'types'), { recursive: true, force: true });
try {
  execFileSync(process.execPath, [join(root, 'node_modules/typescript/bin/tsc'), '-p', join(here, 'tsconfig.dts.json')], { stdio: 'pipe' });
} catch (e) {
  const out = String(e.stdout || '').trim();
  if (out) console.log(`tsc (non-blocking):\n${out}`);
}
writeFileSync(join(here, '.cache', 'types', 'index.d.ts'), "export * from './.design-sync/entry';\n");
console.log('types: .cache/types/index.d.ts');
