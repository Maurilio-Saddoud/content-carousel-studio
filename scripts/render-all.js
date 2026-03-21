import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { execa } from 'execa';
const indexPath = path.resolve('carousels/index.json');
const raw = await readFile(indexPath, 'utf8');
const items = JSON.parse(raw);
for (const item of items) {
    await execa('pnpm', ['render', item.slug], { stdio: 'inherit' });
}
