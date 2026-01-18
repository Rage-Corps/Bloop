import { proxyActivities } from '@temporalio/workflow';
import type * as starsActivities from '../activities/stars';

const { findStarImage, updateStarImage, getCastWithoutImages } = proxyActivities<typeof starsActivities>({
  startToCloseTimeout: '1 minute',
});

export async function starImageDiscoveryWorkflow(): Promise<void> {
  const castWithoutImages = await getCastWithoutImages();
  
  for (const star of castWithoutImages) {
    const imageUrl = await findStarImage(star.name);
    if (imageUrl) {
      await updateStarImage({ id: star.id, imageUrl });
    }
  }
}
