import { CastDao } from '@bloop/database';
import { PornHub } from 'pornhub.js';
import { HttpsProxyAgent } from 'https-proxy-agent';

const PROXY_URL = process.env.PROXY_URL;
const proxyAgent = PROXY_URL ? new HttpsProxyAgent(PROXY_URL) : undefined;

const castDao = new CastDao();

const pornhub = new PornHub();
pornhub.setAgent(proxyAgent);


export interface StarInfo {
  imageUrl: string | null;
  gender: string | null;
}

export async function findStarImage(name: string): Promise<StarInfo> {
  console.log(`🔍 Searching for image for star: ${name}`);
  const MAX_ATTEMPTS = 5;
  const DELAY_MS = 10000;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const searchResult = await pornhub.model(name);
      if (searchResult.name.length) {
        return {
          imageUrl: searchResult.avatar || null,
          gender: searchResult.gender || null,
        };
      }

      // If we successfully reached the API but it explicitly found nothing, 
      // we stop retrying and return null.
      console.log(`ℹ️ Star not found on source: ${name}`);
      return { imageUrl: null, gender: null };
    } catch (error) {
      console.error(`Attempt ${attempt}/${MAX_ATTEMPTS} failed for star: ${name}`, error);
      if (attempt < MAX_ATTEMPTS) {
        console.log(`Waiting ${DELAY_MS / 1000}s before next attempt...`);
        await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
      }
    }
  }

  return { imageUrl: null, gender: null };
}

export async function updateStarImage(params: { id: string; imageUrl?: string | null; gender?: string | null }): Promise<void> {
  await castDao.updateStarInfo(params.id, { imageUrl: params.imageUrl, gender: params.gender });
}

export async function getCastWithoutImages(): Promise<{ id: string, name: string }[]> {
  const cast = await castDao.getCastWithoutImages();
  return cast.map(c => ({ id: c.id, name: c.name }));
}

export async function getAllCastMembers(): Promise<{ id: string, name: string, imageUrl: string | null }[]> {
  const result = await castDao.getAllCastMembers();
  return result.data.map(c => ({ id: c.id, name: c.name, imageUrl: c.imageUrl }));
}

export async function getCastMembersPage(params: { offset: number, limit: number }): Promise<{ id: string, name: string, imageUrl: string | null }[]> {
  const result = await castDao.getAllCastMembers({ offset: params.offset, limit: params.limit });
  return result.data.map(c => ({ id: c.id, name: c.name, imageUrl: c.imageUrl }));
}

export async function getTotalCastCount(): Promise<number> {
  const result = await castDao.getAllCastMembers({ limit: 1 });
  return result.total;
}
