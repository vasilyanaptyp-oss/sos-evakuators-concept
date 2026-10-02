import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const pages=[['lv','automanipulatora-darbi','citi-pakalpojumi','atkritumu-izvesana'],['ru','ru/uslugi-avtomanipulyatora','ru/drugie-uslugi','ru/vyvoz-musora'],['en','en/truck-mounted-crane-services','en/other-services','en/waste-removal']];
for(const [lang,dir,hub,legacy] of pages) {
  const html=fs.readFileSync(path.join(root,dir,'index.html'),'utf8');
  assert.match(html,new RegExp(`<html lang="${lang}">`));
  assert.equal((html.match(/<h1\b/g)||[]).length,1);
  assert.match(html,/<meta name="robots" content="index, follow">/);
  assert.ok(html.includes(`<link rel="canonical" href="https://autopalidziba.lv/${dir}/">`));
  for(const [code,other] of pages) assert.ok(html.includes(`hreflang="${code}" href="https://autopalidziba.lv/${other}/"`));
  assert.equal((html.match(/<img\b/g)||[]).length,4);
  for(const match of html.matchAll(/<img\b[^>]+>/g)) {
    assert.match(match[0],/\balt="[^"]+"/);
    assert.match(match[0],/\bwidth="\d+" height="\d+"/);
    const src=match[0].match(/\bsrc="([^"]+)"/)[1];
    assert.ok(fs.existsSync(path.resolve(root,dir,src)),src);
    for(const source of match[0].match(/srcset="([^"]+)"/)[1].split(',')) {
      assert.ok(fs.existsSync(path.resolve(root,dir,source.trim().split(' ')[0])));
    }
  }
  assert.match(html,/<a class="crane-call" data-dock-watch href="tel:\+37122002700">/);
  assert.match(html,/href="tel:\+37120091762"/);
  const schema=JSON.parse(html.match(/<script type="application\/ld\+json">([^<]+)<\/script>/)[1]);
  assert.equal(schema['@type'],'Service');
  assert.equal(schema.provider.telephone,'+37122002700');
  const hubHtml=fs.readFileSync(path.join(root,hub,'index.html'),'utf8');
  const target=path.posix.relative(hub,dir)+'/';
  assert.ok(hubHtml.includes(`class="directory-item" href="${target}"`));
  assert.ok(!hubHtml.includes('Waste removal')&&!hubHtml.includes('Вывоз мусора')&&!hubHtml.includes('Atkritumu izvešana'));
  assert.match(fs.readFileSync(path.join(root,legacy,'index.html'),'utf8'),/http-equiv="refresh"/);
  console.log(`${lang}: images, links, phones, hreflang, canonical, schema and redirect PASS`);
}
const sitemap=fs.readFileSync(path.join(root,'sitemap.xml'),'utf8');
for(const [,dir,,legacy] of pages) {
  assert.ok(sitemap.includes(`https://autopalidziba.lv/${dir}/`));
  assert.ok(!sitemap.includes(`https://autopalidziba.lv/${legacy}/`));
}
console.log('Sitemap: canonical pages only PASS');
