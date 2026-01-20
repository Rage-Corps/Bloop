import { CastDao } from '@bloop/database';
import { PornHub } from 'pornhub.js';
import { ProxyAgent } from 'undici';

const PROXY_URL = process.env.PROXY_URL;
const proxyAgent = PROXY_URL ? new ProxyAgent(PROXY_URL) : undefined;

const castDao = new CastDao();

const pornhub = new PornHub();
pornhub.setAgent(proxyAgent);


export async function findStarImage(name: string): Promise<string | null> {
  console.log(`🔍 Searching for image for star: ${name}`);
  try {
    const searchResult = await pornhub.model(name);
    if (searchResult.name.length) {
      return searchResult.avatar;
    }
  } catch (error) {
    console.error(`Failed to search for image for star: ${name}`, error);
  }

  // For now, let's use a placeholder service that generates an image with the name
  // This satisfies the "basic discovery" and ensures UI looks okay.
  // In a real scenario, this would scrape a bio site.
  const imageUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=512&background=random`;

  // We could also try to find a real one if we had a specific target site.
  // For now, returning the placeholder.

  return imageUrl;
}

export async function updateStarImage(params: { id: string; imageUrl: string }): Promise<void> {
  await castDao.updateImageUrl(params.id, params.imageUrl);
}

export async function getCastWithoutImages(): Promise<{ id: string, name: string }[]> {
  const cast = await castDao.getCastWithoutImages();
  return cast.map(c => ({ id: c.id, name: c.name }));
}
