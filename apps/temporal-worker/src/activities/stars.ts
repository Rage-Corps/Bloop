import { CastDao } from '@bloop/database';
import { PornHub } from 'pornhub.js';
import { HttpsProxyAgent } from 'https-proxy-agent';

const PROXY_URL = process.env.PROXY_URL;
const proxyAgent = PROXY_URL ? new HttpsProxyAgent(PROXY_URL) : undefined;

const castDao = new CastDao();

const pornhub = new PornHub();
pornhub.setAgent(proxyAgent);


export async function findStarImage(name: string): Promise<string | null> {
  console.log(`🔍 Searching for image for star: ${name}`);
  const MAX_ATTEMPTS = 5;
  const DELAY_MS = 10000;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const searchResult = await pornhub.model(name);
      if (searchResult.name.length) {
        return searchResult.avatar;
      }

      // If we successfully reached the API but it explicitly found nothing, 
      // we stop retrying and return null.
      console.log(`ℹ️ Star not found on source: ${name}`);
      return null;
    } catch (error) {
      console.error(`Attempt ${attempt}/${MAX_ATTEMPTS} failed for star: ${name}`, error);
      if (attempt < MAX_ATTEMPTS) {
        console.log(`Waiting ${DELAY_MS / 1000}s before next attempt...`);
        await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
      }
    }
  }

  // All retries failed due to errors (e.g., network issues, timeouts).
  // Use a placeholder service to ensure the UI looks okay and data exists.
  console.warn(`⚠️ All retries failed for ${name}. Returning fallback image.`);
  const imageUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=512&background=random`;

  return imageUrl;
}

export async function updateStarImage(params: { id: string; imageUrl: string }): Promise<void> {
  await castDao.updateImageUrl(params.id, params.imageUrl);
}

export async function getCastWithoutImages(): Promise<{ id: string, name: string }[]> {
  const cast = await castDao.getCastWithoutImages();
  return cast.map(c => ({ id: c.id, name: c.name }));
}

export async function getAllCastMembers(): Promise<{ id: string, name: string, imageUrl: string | null }[]> {
  const result = await castDao.getAllCastMembers();
  return result.data.map(c => ({ id: c.id, name: c.name, imageUrl: c.imageUrl }));
}
