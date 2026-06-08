import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const dist = path.join(root, 'client', 'dist');
const indexHtml = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
const scriptPath = indexHtml.match(/src="\/assets\/([^"]+\.js)"/)?.[1];
const stylePath = indexHtml.match(/href="\/assets\/([^"]+\.css)"/)?.[1];

if (!scriptPath || !stylePath) {
  throw new Error('Could not find built JavaScript or CSS assets');
}

const heroPath = path.join(dist, 'assets', 'hero-industrial-new.png');
const heroData = `data:image/png;base64,${fs.readFileSync(heroPath).toString('base64')}`;
const inlineAsset = (content) => content
  .replaceAll('/assets/hero-industrial-new.png', heroData)
  .replaceAll('</script', '<\\/script');

const css = inlineAsset(fs.readFileSync(path.join(dist, 'assets', stylePath), 'utf8'));
const javascript = inlineAsset(fs.readFileSync(path.join(dist, 'assets', scriptPath), 'utf8'));
const standalone = `<!doctype html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Цифровой паспорт промышленного туриста" />
    <title>Цифровой паспорт промышленного туриста</title>
    <style>${css}</style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module">${javascript}</script>
  </body>
</html>
`;

for (const fileName of [
  'preview.html',
  'industrial-tourist-passport-single.html',
  'industrial-tourist-passport-repo-single.html'
]) {
  fs.writeFileSync(path.join(root, fileName), standalone, 'utf8');
  console.log(`Updated ${fileName}`);
}
