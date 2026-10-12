// Stage a servable copy of the site in dist/ (pages at their real URLs, plus styles, assets and fonts).
import fs from 'node:fs/promises';
import path from 'node:path';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const dist = path.join(root, 'dist');
await fs.rm(dist, { recursive: true, force: true });
await fs.mkdir(dist, { recursive: true });
await fs.cp(path.join(root, 'src/pages'), dist, { recursive: true });
await fs.cp(path.join(root, 'src/styles'), path.join(dist, 'styles'), { recursive: true });
await fs.cp(path.join(root, 'public'), dist, { recursive: true });
console.log('staged dist/');
