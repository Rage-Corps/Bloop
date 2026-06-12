import { SourceDao, MediaDao } from '@bloop/database';
import { fetch as undiciFetch } from 'undici';

export async function getMediaSources() {
  const sourceDao = new SourceDao();
  return await sourceDao.getAllSources();
}

export async function getMediaSourcesPaginated(options: { limit?: number; offset?: number } = {}) {
  const sourceDao = new SourceDao();
  return await sourceDao.getSourcesPaginated(options);
}

const BROKEN_STATUS_CODES = new Set([403, 404, 419, 503, 523]);
const BROKEN_BODY_PATTERNS = [
  'video not found',
  'file is no longer available',
  'find the video you are looking for',
];

/**
 * Validates a media source.
 * Returns true if the source is valid, false if it's broken.
 * Throws an error for transient issues to trigger Temporal retries.
 */
export async function validateMediaSource(url: string): Promise<boolean> {
  try {

    const response = await undiciFetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    console.log(`${url} - ${response.status}`);
    if (BROKEN_STATUS_CODES.has(response.status)) {
      return false;
    }

    const body = await response.text();
    const bodyLower = body.toLowerCase();
    if (BROKEN_BODY_PATTERNS.some(pattern => bodyLower.includes(pattern))) {
      console.log(`❌ Source broken: ${url}`);
      return false;
    }

    return true;
  } catch (error: any) {
    // If it's a timeout or connection reset, we let Temporal retry.
    // If it's something like DNS failure, it might be permanent but let's be safe and retry.
    console.error(`Error validating source ${url}:`, error.message);
    throw error;
  }
}

export async function deleteMediaSource(sourceId: string, mediaId: string) {
  const sourceDao = new SourceDao();
  const mediaDao = new MediaDao();

  console.log(`🗑️ Deleting broken source: ${sourceId} (Media: ${mediaId})`);
  await sourceDao.deleteSource(sourceId);

  const remainingSources = await sourceDao.countSourcesForMedia(mediaId);
  if (remainingSources === 0) {
    console.log(`🗑️ Deleting orphaned media: ${mediaId}`);
    await mediaDao.deleteMedia(mediaId);
    return { sourceDeleted: true, mediaDeleted: true };
  }

  return { sourceDeleted: true, mediaDeleted: false };
}
