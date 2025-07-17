import fs from 'fs';
import path from 'path';

const dataDirectory = path.join(process.cwd(), 'data');

function readJsonFile(fileName) {
  const filePath = path.join(dataDirectory, fileName);
  try {
    const fileContents = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    console.error(`Error reading or parsing ${fileName}:`, error);
    return null;
  }
}

export function getAllPromos() {
  const fileNames = fs.readdirSync(dataDirectory);
  const promoFiles = fileNames.filter(name => name.startsWith('anuncios-') && name !== 'anuncios-fixos.json');

  let allPromos = [];
  for (const fileName of promoFiles) {
    const promosFromFile = readJsonFile(fileName);
    if (Array.isArray(promosFromFile)) {
      allPromos = [...allPromos, ...promosFromFile];
    }
  }

  return allPromos.sort((a, b) => new Date(b.date) - new Date(a.date));
}

export function getPromosByStore(store) {
  const allPromos = getAllPromos();
  return allPromos.filter(promo => promo.store.toLowerCase() === store.toLowerCase());
}

export function getAllStores() {
  const allPromos = getAllPromos();
  const stores = allPromos.map(promo => promo.store);
  return [...new Set(stores)];
}

export function getFixedLinks() {
  return readJsonFile('links-fixos.json') || [];
}

export function getFixedAnuncios() {
  return readJsonFile('anuncios-fixos.json') || [];
}

export function getAboutData() {
  return readJsonFile('sobre.json') || {};
}