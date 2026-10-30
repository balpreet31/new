import fs from 'node:fs/promises';
import sharp from 'sharp';
import path from 'node:path';
const assets=JSON.parse(await fs.readFile(new URL('./generated-assets.json',import.meta.url),'utf8'));
for(const asset of assets){
 const source=path.resolve(process.env.GENERATED_IMAGES_DIR||'design-assets/masters',asset.source);
 const width=asset.name==='hero-v2'?1920:1400;
 const main=await sharp(source).resize({width,withoutEnlargement:true}).webp({quality:83}).toFile(`public/images/${asset.name}.webp`);
 await sharp(source).resize({width:760,withoutEnlargement:true}).webp({quality:82}).toFile(`public/images/${asset.name}-card.webp`);
 console.log(`${asset.name}: ${main.width}×${main.height}, ${Math.round(main.size/1024)} KB`);
}
