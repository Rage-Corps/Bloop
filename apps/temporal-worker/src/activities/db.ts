import { MediaDao, CastDao } from '@bloop/database';
import { CreateMediaInput } from '@bloop/shared-types';

export async function saveMedia(media: CreateMediaInput) {
  const mediaDao = new MediaDao();
  return mediaDao.upsertMedia(media);
}

export async function getCastByName(name: string) {
  const castDao = new CastDao();
  return castDao.getByName(name);
}
