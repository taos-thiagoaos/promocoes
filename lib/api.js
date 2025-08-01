import fs from 'fs';
import path from 'path';
import { AnuncioModel } from '../models/AnuncioModel';
import { SUGGESTION_MAX_AGE_DAYS } from '../config';
import { subDays } from 'date-fns';

const dataDirectory = path.join(process.cwd(), 'data');

function readJsonFile(fileName) {
  const filePath = path.join(dataDirectory, fileName);
  try {
    const fileContents = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    if (error.code === 'ENOENT') return null;
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
      const promoModels = promosFromFile.map(promo => new AnuncioModel(promo));
      allPromos = [...allPromos, ...promoModels];
    }
  }

  return allPromos.sort((a, b) => {
    // compare date as string, since the format is YYYY-MM-DD
    if (a.date > b.date) return -1; 
    if (a.date < b.date) return 1; 
    
    // if dates are equal, compare by index in the original array
    const aIndex = allPromos.indexOf(a);
    const bIndex = allPromos.indexOf(b);
    return bIndex - aIndex; // bigger index comes first
  });
}

export function getPromoById(id, date) {
  const fileName = `anuncios-${date}.json`;
  const promos = readJsonFile(fileName);
  if (!promos) return null;

  const promoData = promos.find(p => p.id === id);
  return promoData ? new AnuncioModel(promoData) : null;
}

export function getPromoBySlug(date, slug) {
  const fileName = `anuncios-${date}.json`;
  const promos = readJsonFile(fileName);
  if (!promos) return null;

  const promoData = promos.find(p => new AnuncioModel(p).slug === slug);
  return promoData ? new AnuncioModel(promoData) : null;
}

export function getSuggestedPromos(currentPromoId) {
  const allPromos = getAllPromos();
  const thirtyDaysAgo = subDays(new Date(), SUGGESTION_MAX_AGE_DAYS);

  const recentPromos = allPromos.filter(promo => 
    new Date(promo.date) >= thirtyDaysAgo && promo.id !== currentPromoId
  );

  const shuffled = recentPromos.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 3);
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