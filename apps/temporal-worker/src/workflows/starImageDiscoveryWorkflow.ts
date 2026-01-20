import { proxyActivities } from '@temporalio/workflow';
import type * as starsActivities from '../activities/stars';

const { findStarImage, updateStarImage, getAllCastMembers } = proxyActivities<typeof starsActivities>({
  startToCloseTimeout: '1 minute',
});

export async function starImageDiscoveryWorkflow(): Promise<void> {
  const allCastMembers = await getAllCastMembers();
  
  for (const star of allCastMembers) {
    const imageUrl = await findStarImage(star.name);
    if (imageUrl) {
      await updateStarImage({ id: star.id, imageUrl });
    }
  }
}
