// Stage a servable copy of the site in dist/ (pages at their real URLs, plus styles, assets and fonts).
import fs from 'node:fs/promises';
import path from 'node:path';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const dist = path.join(root, 'dist');
await fs.rm(dist, { recursive: true, force: true });
await fs.mkdir(dist, { recursive: true });
const cms = JSON.parse(await fs.readFile(path.join(root, 'src/cms/content.json'), 'utf8'));
for (const route of Object.keys(cms.pageContent)) {
  const file = route === '/' ? 'index.html' : route.replace(/^\//, '') + '/index.html';
  await fs.mkdir(path.dirname(path.join(dist, file)), { recursive: true });
  await fs.copyFile(path.join(root, file), path.join(dist, file));
}
await fs.cp(path.join(root, 'src/styles'), path.join(dist, 'styles'), { recursive: true });
await fs.cp(path.join(root, 'public'), dist, { recursive: true });
console.log('staged dist/');
