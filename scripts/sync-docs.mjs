import { copyFileSync } from 'node:fs';
for (const name of ['INTEGRATION.md', 'GAP-LEDGER.md']) {
  copyFileSync(new URL('../docs/' + name, import.meta.url), new URL('../public/' + name, import.meta.url));
}
