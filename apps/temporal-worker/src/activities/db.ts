import { MediaDao } from '@bloop/database';
import { CreateMediaInput } from '@bloop/shared-types';

export async function saveMedia(media: CreateMediaInput) {
  const mediaDao = new MediaDao();
  return mediaDao.upsertMedia(media);
}
