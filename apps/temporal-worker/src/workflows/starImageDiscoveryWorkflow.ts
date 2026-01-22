import { proxyActivities, continueAsNew } from '@temporalio/workflow';
import type * as starsActivities from '../activities/stars';

const { findStarImage, updateStarImage, getCastMembersPage, getTotalCastCount } = proxyActivities<typeof starsActivities>({
  startToCloseTimeout: '10 minutes',
});

const BATCH_SIZE = 10;
const BATCHES_PER_RUN = 10; // Process 100 stars per run before continuing

export interface StarImageDiscoveryInput {
  processedCount?: number;
  totalCount?: number;
}

export interface StarImageDiscoveryResult {
  totalProcessed: number;
  imagesUpdated: number;
}

export async function starImageDiscoveryWorkflow(input: StarImageDiscoveryInput = {}): Promise<StarImageDiscoveryResult> {
  let processedCount = input.processedCount ?? 0;
  let imagesUpdated = 0;

  // Fetch total count if not provided (first run)
  const totalCount = input.totalCount ?? await getTotalCastCount();

  if (processedCount === 0) {
    console.log(`Starting Star Image Discovery Workflow for ${totalCount} cast members`);
  } else {
    console.log(`Continuing Star Image Discovery Workflow at ${processedCount}/${totalCount}`);
  }

  // Process up to BATCHES_PER_RUN batches in this run
  const starsToProcessThisRun = Math.min(BATCH_SIZE * BATCHES_PER_RUN, totalCount - processedCount);
  
  if (starsToProcessThisRun <= 0) {
    return {
      totalProcessed: processedCount,
      imagesUpdated: 0,
    };
  }

  // Fetch only the stars needed for this run
  const starsThisRun = await getCastMembersPage({ 
    offset: processedCount, 
    limit: starsToProcessThisRun 
  });

  const endIndex = processedCount + starsThisRun.length;

  for (let i = 0; i < starsThisRun.length; i += BATCH_SIZE) {
    const batch = starsThisRun.slice(i, Math.min(i + BATCH_SIZE, starsThisRun.length));
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatchesThisRun = Math.ceil(starsThisRun.length / BATCH_SIZE);

    console.log(`Processing batch ${batchNum}/${totalBatchesThisRun} (${batch.length} stars)`);

    const results = await Promise.allSettled(
      batch.map(star => findStarImage(star.name))
    );

    for (let j = 0; j < results.length; j++) {
      const result = results[j];
      const star = batch[j];

      if (result.status === 'fulfilled' && result.value) {
        await updateStarImage({ id: star.id, imageUrl: result.value });
        imagesUpdated++;
      }
    }
  }

  processedCount = endIndex;

  // Continue with fresh history if more stars remain
  if (processedCount < totalCount) {
    console.log(`Processed ${processedCount}/${totalCount} stars, continuing with fresh history...`);
    await continueAsNew<typeof starImageDiscoveryWorkflow>({
      processedCount,
      totalCount,
    });
  }

  // Workflow complete
  console.log(`Star Image Discovery Workflow completed: ${processedCount} stars processed`);

  return {
    totalProcessed: processedCount,
    imagesUpdated,
  };
}
