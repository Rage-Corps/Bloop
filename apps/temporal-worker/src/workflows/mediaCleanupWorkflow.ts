import { proxyActivities, sleep } from '@temporalio/workflow';
import type * as activities from '../activities/mediaCleanup';

const { getMediaSources, validateMediaSource, deleteMediaSource } = proxyActivities<typeof activities>({
  startToCloseTimeout: '10 minutes',
  retry: {
    initialInterval: '1s',
    backoffCoefficient: 2,
    maximumInterval: '1 minute',
    maximumAttempts: 3,
  },
});

const BATCH_SIZE = 10;

export async function mediaCleanupWorkflow(): Promise<{ totalProcessed: number; brokenSources: number; mediaDeleted: number }> {
  console.log('🧹 Starting Media Cleanup Workflow');

  const sources = await getMediaSources();
  console.log(`📊 Found ${sources.length} sources to validate`);

  let brokenSourcesCount = 0;
  let mediaDeletedCount = 0;

  for (let i = 0; i < sources.length; i += BATCH_SIZE) {
    const batch = sources.slice(i, i + BATCH_SIZE);
    console.log(`📦 Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(sources.length / BATCH_SIZE)} (${batch.length} sources)`);

    // Validate batch in parallel
    const results = await Promise.allSettled(
      batch.map(source => validateMediaSource(source.url))
    );

    // Process results
    for (let j = 0; j < results.length; j++) {
      const result = results[j];
      const source = batch[j];

      if (result.status === 'fulfilled') {
        const isValid = result.value;
        console.log(`✅ Source validated: ${source.url} - ${isValid ? '✅' : '❌'}`);

        if (!isValid) {
          console.log(`❌ Source broken: ${source.url}`);
          const deleteResult = await deleteMediaSource(source.id, source.mediaId);
          brokenSourcesCount++;
          if (deleteResult.mediaDeleted) {
            mediaDeletedCount++;
          }
        }
      } else {
        console.error(`⚠️ Failed to validate source ${source.url} after retries:`, result.reason);
        // We skip if it permanently fails validation after retries
      }
    }

    // Rate limiting between batches
    if (i + BATCH_SIZE < sources.length) {
      await sleep('500ms');
    }
  }

  console.log('✅ Media Cleanup Workflow completed');
  console.log(`📊 Results: ${brokenSourcesCount} broken sources removed, ${mediaDeletedCount} orphaned media deleted`);

  return {
    totalProcessed: sources.length,
    brokenSources: brokenSourcesCount,
    mediaDeleted: mediaDeletedCount,
  };
}
