// Generates src/pages/*.html from src/cms/content.json. The generated HTML is committed: it is what the WWS
// importer reads. Edit content.json (or the templates here) and re-run: node scripts/generate-pages.mjs
import fs from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const cms = JSON.parse(await fs.readFile(path.join(root, 'src/cms/content.json'), 'utf8'));
const esc = value => String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const img = (image, cls = '') => `<img${cls ? ` class="${cls}"` : ''} src="${esc(image.src)}" alt="${esc(image.alt ?? '')}">`;
const link = (href, inner, cls = '') => `<a${cls ? ` class="${cls}"` : ''} href="${esc(href)}">${inner}</a>`;
const lines = list => list.map(esc).join('<br>');

function nav(items) {
  return `<nav class="main-nav" id="main-nav" aria-label="Main navigation"><ul>${items.map(item => `<li>${link(item.href, esc(item.label))}${item.children ? `<ul>${item.children.map(child => `<li>${link(child.href, esc(child.label))}</li>`).join('')}</ul>` : ''}</li>`).join('')}</ul></nav>`;
}

function header(page) {
  const { site } = cms;
  return `<header class="site-header${['home', 'contact'].includes(page.type) ? ' is-home' : ''}"><section class="header-inner"><button class="menu-toggle" type="button" aria-controls="main-nav" aria-expanded="false" aria-label="Open navigation"><span></span><span></span><span></span></button>${link('/', img(site.logo), 'brand')}${nav(site.nav)}${img(site.badge, 'badge')}</section></header>`;
}

function footer(page) {
  const f = cms.site.footer;
  return `<footer class="site-footer${['home', 'contact'].includes(page.type) ? ' footer-inset' : ''}"><section class="footer-inner"><p class="footer-id">${esc(f.title)}<br><strong>${esc(f.abn)}</strong></p><div class="footer-columns">${f.columns.map(c => `<div><h2>${esc(c.heading)}</h2><ul>${c.lines.map(line => `<li>${esc(line)}</li>`).join('')}</ul></div>`).join('')}</div><hr class="footer-rule"><p class="footer-credit">${esc(f.credit.text)} ${link(f.credit.href, esc(f.credit.label))}</p></section></footer>`;
}


const runHtml = run => {
  if (run.text === '\n') return '<br>';
  let html = esc(run.text);
  if (run.em) html = `<em>${html}</em>`;
  if (run.strong) html = `<strong>${html}</strong>`;
  if (run.href) html = `<a href="${esc(run.href)}"${run.newTab ? ' target="_blank" rel="noopener"' : ''}>${html}</a>`;
  return html;
};
const runsHtml = runs => runs.map(runHtml).join('');
const plainText = runs => runs.map(run => run.text).join('').trim();
const alignClass = block => (block.align && block.align !== 'start' && block.align !== 'left' ? ` class="align-${esc(block.align)}"` : '');

function renderBlocks(blocks) {
  return blocks.map(block => {
    switch (block.type) {
      case 'heading': return `<h${block.level}${alignClass(block)}>${runsHtml(block.runs)}</h${block.level}>`;
      case 'paragraph': {
        const text = plainText(block.runs);
        if (text === 'Read More' && block.runs[0]?.href) return `<p class="read-more">${link(block.runs[0].href, 'Read More')}</p>`;
        const inline = [block.color && `color:${block.color}`, block.fontSize && `font-size:${block.fontSize}`].filter(Boolean).join(';');
        return `<p${alignClass(block)}${inline ? ` style="${esc(inline)}"` : ''}>${runsHtml(block.runs)}</p>`;
      }
      case 'list': return `<${block.ordered ? 'ol' : 'ul'}>${block.items.map(item => `<li>${runsHtml(item)}</li>`).join('')}</${block.ordered ? 'ol' : 'ul'}>`;
      case 'images': {
        const figures = block.items.map(item => { const image = img(item); return `<figure>${item.href ? link(item.href, image) : image}</figure>`; }).join('');
        return `<div class="figures figures-${block.items.length}">${figures}</div>`;
      }
      case 'columns': return block.rows.map(row => `<div class="columns columns-${row.length}">${row.map(cell => `<div class="column">${renderBlocks(cell)}</div>`).join('')}</div>`).join('');
      case 'accordion': return `<details class="accordion"><summary>${runsHtml(block.title)}</summary><div class="accordion-panel">${renderBlocks(block.blocks)}</div></details>`;
      case 'rule': return '<hr>';
      case 'panel': return `<div class="panel" style="background:${esc(block.background)}">${renderBlocks(block.blocks)}</div>`;
      case 'embed': return embed({ title: block.title || 'Embedded content', src: block.src, height: block.height || 600 });
      default: return '';
    }
  }).join('\n');
}

const embed = e => `<iframe class="embed embed-${/jotform/.test(e.src) ? 'jotform' : 'tradehq'}" title="${esc(e.title)}" src="${esc(e.src)}" height="${e.height}" loading="lazy"></iframe>`;

const templates = {
  service: page => `<main><section class="page page-wide">
<section class="banner banner-service band">${page.banner.icon ? img(page.banner.icon, 'banner-icon') : ''}<h1>${esc(page.banner.title)}</h1>${page.banner.logo ? img(page.banner.logo, 'banner-logo') : ''}</section>
<section class="content">${renderBlocks(page.blocks)}</section>
</section></main>`,
  about: page => `<main><section class="page page-wide">
<section class="banner band${longTitle(page.banner.title) ? ' banner-long' : ''}"><h1>${esc(page.banner.title)}</h1></section>
<section class="content content-about">${renderBlocks(page.blocks)}</section>
</section></main>`,
  contact: page => `<main><section class="page page-contact band">
<h1 class="contact-title">${esc(page.banner.title)}</h1>
${page.blocks.length ? `<section class="contact-cards">${(() => {
    const cards = [];
    let card = null;
    for (const block of page.blocks) { if (block.type === 'images') { card = { image: block.items[0], blocks: [] }; cards.push(card); } else if (card) card.blocks.push(block); }
    return cards.map(c => `<article class="contact-card">${img(c.image, 'contact-icon')}${renderBlocks(c.blocks)}</article>`).join('');
  })()}</section>` : ''}
<section class="contact-forms">${page.forms.map(form => `<article class="contact-card form-card">${img(form.icon, 'contact-icon')}<h2>${esc(form.heading)}</h2><form class="enquiry-form" action="#" method="post">${form.fields.map(field => `<label class="field"><span>${esc(field.label)}${field.required ? ' <b>*</b>' : ''}</span>${field.type === 'select' ? `<select name="${esc(field.name)}">${field.options.map(o => `<option>${esc(o)}</option>`).join('')}</select>` : field.type === 'textarea' ? `<textarea name="${esc(field.name)}" rows="5"></textarea>` : field.type === 'name' ? `<span class="name-pair"><input type="text" name="first" placeholder="First"><input type="text" name="last" placeholder="Last"></span>` : `<input type="${field.type}" name="${esc(field.name)}">`}</label>`).join('')}<button type="submit" class="submit">SUBMIT</button></form></article>`).join('')}</section>
</section></main>`,
  listing: page => {
    const posts = [];
    for (const block of page.blocks) {
      if (block.type === 'heading' && block.level === 2) posts.push([]);
      if (posts.length) posts[posts.length - 1].push(block);
    }
    return `<main><section class="page page-wide">
<section class="banner band${longTitle(page.banner.title) ? ' banner-long' : ''}"><h1>${esc(page.banner.title)}</h1></section>
<section class="content content-blog"><div class="blog-main">${posts.map(blocks => `<article class="post">${renderBlocks(blocks)}</article>`).join('')}</div>
<aside class="blog-aside"><h2>${esc(page.sidebar.heading)}</h2><ul>${page.sidebar.items.map(item => `<li>${link(item.href, esc(item.label))}</li>`).join('')}</ul></aside></section>
</section></main>`;
  },
  post: page => `<main><section class="page page-wide">
<section class="banner band${longTitle(page.banner.title) ? ' banner-long' : ''}"><h1>${esc(page.banner.title)}</h1></section>
<section class="content content-blog"><div class="blog-main"><article class="post post-single">${renderBlocks(page.blocks)}</article></div>
<aside class="blog-aside"><h2>${esc(page.sidebar.heading)}</h2><ul>${page.sidebar.items.map(item => `<li>${link(item.href, esc(item.label))}</li>`).join('')}</ul></aside></section>
</section></main>`,
  home: page => `<main><section class="page">
<section class="hero">${img(page.hero.image)}<div class="hero-card"><h1>${esc(page.hero.heading)}</h1><div class="lead"><p>${esc(page.hero.tagline)}</p>${link(page.hero.phone.href, esc(page.hero.phone.label), 'phone')}</div>${link(page.hero.banner.href, img(page.hero.banner), 'banner')}</div></section>
<section class="cards">${page.cards.map(card => `<article class="card">${link(card.icon.href, img(card.icon))}<h2>${esc(card.heading)}</h2>${link(card.button.href, esc(card.button.label), 'btn')}<p>${esc(card.text)}</p>${img(card.logo, 'logo')}</article>`).join('')}</section>
<section class="enquiry">${page.enquiry.embeds.slice(0, 1).map(embed).join('')}<h2>${esc(page.enquiry.heading)}</h2>${page.enquiry.embeds.slice(1).map(embed).join('')}</section>
</section></main>`,
};

const longTitle = title => title.length > 22;
const outDir = path.join(root, 'src/pages');
await fs.mkdir(outDir, { recursive: true });
for (const [route, page] of Object.entries(cms.pageContent)) {
  const render = templates[page.type];
  if (!render) throw new Error(`No template for page type "${page.type}" (${route})`);
  const file = route === '/' ? 'index.html' : /\.html$/.test(route) ? route.replace(/^\//, '') : route.replace(/^\//, '') + '/index.html';
  const html = `<!doctype html>
<html lang="en-AU">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(page.seo.title)}</title>
<meta name="description" content="${esc(page.seo.description)}">
<link rel="stylesheet" href="/styles/site.css">
</head>
<body>
${header(page)}
${render(page)}
${footer(page)}
<script>document.querySelector('.menu-toggle').addEventListener('click',function(){var open=this.getAttribute('aria-expanded')!=='true';this.setAttribute('aria-expanded',String(open));this.setAttribute('aria-label',open?'Close navigation':'Open navigation');document.getElementById('main-nav').classList.toggle('open',open)})</script>
</body>
</html>
`;
  await fs.mkdir(path.dirname(path.join(outDir, file)), { recursive: true });
  await fs.writeFile(path.join(outDir, file), html);
  console.log(`wrote src/pages/${file}`);
}
