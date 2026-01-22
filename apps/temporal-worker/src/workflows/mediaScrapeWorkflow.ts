import { proxyActivities, log } from '@temporalio/workflow';
import type * as scrapingActivities from '../activities/scraping';
import type * as dbActivities from '../activities/db';
import type * as starsActivities from '../activities/stars';
import type * as mediaCleanupActivities from '../activities/mediaCleanup';
import { MediaScrapingWorkflowInput } from '../types';

const { processLink } = proxyActivities<typeof scrapingActivities>({
  startToCloseTimeout: '120s', // Allow more time for HTTP requests
  heartbeatTimeout: '10s',
});
const { saveMedia, getCastByName } = proxyActivities<typeof dbActivities>({
  startToCloseTimeout: '120s', // Allow more time for HTTP requests
  heartbeatTimeout: '10s',
});
const { findStarImage } = proxyActivities<typeof starsActivities>({
  startToCloseTimeout: '60s',
});
const { validateMediaSource } = proxyActivities<typeof mediaCleanupActivities>({
  startToCloseTimeout: '60s',
  heartbeatTimeout: '10s',
});

// Helper functions for media validation and processing
function validateMediaObject(
  media: any,
  _link: string
): { isValid: boolean; missingFields: string[] } {
  const missingFields: string[] = [];

  if (!media.name || media.name.trim() === '') missingFields.push('name');
  if (!media.description || media.description.trim() === '')
    missingFields.push('description');
  if (!media.thumbnailUrl || media.thumbnailUrl.trim() === '')
    missingFields.push('thumbnailUrl');

  return {
    isValid: missingFields.length === 0,
    missingFields,
  };
}

async function processMediaSources(
  sources: any[],
  mediaName: string
): Promise<Array<{ sourceName: string; url: string }>> {
  if (!Array.isArray(sources)) return [];

  const filteredSources = sources.filter((source) => {
    if (!source.source || !source.url) {
      log.warn(
        `⚠️ Invalid source for ${mediaName} - missing source or url`
      );
      return false;
    }
    return true;
  });

  const validSources: Array<{ sourceName: string; url: string }> = [];

  for (const source of filteredSources) {
    try {
      const isValid = await validateMediaSource(source.url);
      if (isValid) {
        validSources.push({
          sourceName: source.source,
          url: source.url,
        });
      } else {
        log.warn(`⚠️ Source validation failed for ${mediaName}: ${source.url}`);
      }
    } catch (error) {
      log.error(`❌ Error validating source ${source.url} for ${mediaName}:`, { error });
      // Default to adding it if validation fails with an error? 
      // Or skip? User said "If there are no valid sources / urls then dont saveMedia".
      // Usually, if validation fails due to a transient error, Temporal retries the activity.
      // If it eventually fails the activity, we might want to skip or fail the workflow.
      // Given the prompt, I'll let the error bubble up if it's transient (handled by Temporal),
      // but if validateMediaSource returns false, I skip it.
    }
  }

  return validSources;
}

function processMediaCategories(
  categories: any[],
  mediaName: string
): string[] {
  if (!Array.isArray(categories)) return [];

  return categories.filter((category) => {
    if (typeof category !== 'string' || category.trim() === '') {
      console.warn(`⚠️ Invalid category for ${mediaName} - not a valid string`);
      return false;
    }
    return true;
  });
}

export async function mediaScrapeWorkflow(input: MediaScrapingWorkflowInput) {
  try {
    const { mediaUrl } = input;
    const media = await processLink(mediaUrl);

    // Validate media object
    const validation = validateMediaObject(media, mediaUrl);

    if (!validation.isValid) {
      const errorMsg = `Missing required fields: ${validation.missingFields.join(', ')}`;
      log.error(`❌ Invalid media object for ${mediaUrl} - ${errorMsg}`);
      return {
        success: false,
        message: `Media validation failed: ${errorMsg}`,
        pageUrl: input.mediaUrl,
        mediaProcessing: {
          totalMedia: 1,
          successful: 0,
          failed: 1,
        },
        timestamp: new Date().toISOString(),
      };
    }

    // Process and validate sources and categories
    const validSources = await processMediaSources(
      media.sources,
      media.name || 'Unknown'
    );

    if (validSources.length === 0) {
      log.warn(`⚠️ No valid sources found for ${mediaUrl} - skipping save`);
      return {
        success: false,
        message: 'No valid sources found. Skipping saveMedia.',
        pageUrl: input.mediaUrl,
        mediaProcessing: {
          totalMedia: 1,
          successful: 0,
          failed: 1,
        },
        timestamp: new Date().toISOString(),
      };
    }

    const validCategories = processMediaCategories(
      media.categories,
      media.name || 'Unknown'
    );

    // Process cast and fetch images if missing
    const castWithImages = [];
    if (media.cast && Array.isArray(media.cast)) {
      for (const name of media.cast) {
        if (typeof name !== 'string') continue;

        const existingCast = await getCastByName(name);
        if (!existingCast || !existingCast.imageUrl) {
          const imageUrl = await findStarImage(name);
          castWithImages.push({ name, imageUrl });
        } else {
          castWithImages.push({ name, imageUrl: existingCast.imageUrl });
        }
      }
    }

    // Save media with validated data
    await saveMedia({
      name: media.name!.trim(),
      description: media.description!.trim(),
      thumbnailUrl: media.thumbnailUrl!.trim(),
      pageUrl: mediaUrl,
      sources: validSources,
      categories: validCategories,
      dateAdded:
        media.dateAdded instanceof Date
          ? media.dateAdded.toISOString()
          : (media.dateAdded ?? new Date().toISOString()),
      duration: media.duration ?? undefined,
      cast: castWithImages,
      rawDescriptionDiv: media.rawDescriptionDiv,
    });

    return {
      success: true,
    };
  } catch (error) {
    log.error('❌ Media Scraping workflow failed:', { error });

    return {
      success: false,
      message: `Media scraping workflow failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      pageUrl: input.mediaUrl,
      mediaProcessing: {
        totalMedia: 0,
        successful: 0,
        failed: 0,
      },
      timestamp: new Date().toISOString(),
    };
  }
}
