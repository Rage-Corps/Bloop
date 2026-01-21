import { proxyActivities } from '@temporalio/workflow';
import type * as starsActivities from '../activities/stars';

const { findStarImage, updateStarImage, getAllCastMembersUnpaginated } = proxyActivities<typeof starsActivities>({
  startToCloseTimeout: '10 minutes',
});

const BATCH_SIZE = 10;

export async function starImageDiscoveryWorkflow(): Promise<void> {
  const allCastMembers = await getAllCastMembersUnpaginated();

  for (let i = 0; i < allCastMembers.length; i += BATCH_SIZE) {
    const batch = allCastMembers.slice(i, i + BATCH_SIZE);

    const results = await Promise.allSettled(
      batch.map(star => findStarImage(star.name))
    );

    for (let j = 0; j < results.length; j++) {
      const result = results[j];
      const star = batch[j];

      if (result.status === 'fulfilled' && result.value) {
        await updateStarImage({ id: star.id, imageUrl: result.value });
      }
    }
  }
}
