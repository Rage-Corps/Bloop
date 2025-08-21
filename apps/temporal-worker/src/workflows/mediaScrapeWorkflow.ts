import { proxyActivities } from '@temporalio/workflow';
import type * as scrapingActivities from '../activities/scraping';
import type * as dbActivities from '../activities/db';
import { MediaScrapingWorkflowInput } from '../types';

const { processLink } = proxyActivities<typeof scrapingActivities>({
  startToCloseTimeout: '120s', // Allow more time for HTTP requests
  heartbeatTimeout: '10s',
});
const { saveMedia } = proxyActivities<typeof dbActivities>({
  startToCloseTimeout: '120s', // Allow more time for HTTP requests
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

function processMediaSources(
  sources: any[],
  mediaName: string
): Array<{ sourceName: string; url: string }> {
  if (!Array.isArray(sources)) return [];

  return sources
    .filter((source) => {
      if (!source.source || !source.url) {
        console.warn(
          `⚠️ Invalid source for ${mediaName} - missing source or url`
        );
        return false;
      }
      return true;
    })
    .map((source) => ({
      sourceName: source.source, // Map 'source' to 'sourceName' for database
      url: source.url,
    }));
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
      console.error(`❌ Invalid media object for ${mediaUrl} - ${errorMsg}`);
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
    const validSources = processMediaSources(media.sources, media.name || 'Unknown');
    const validCategories = processMediaCategories(media.categories, media.name || 'Unknown');

    // Save media with validated data
    await saveMedia({
      name: media.name!.trim(),
      description: media.description!.trim(),
      thumbnailUrl: media.thumbnailUrl!.trim(),
      pageUrl: mediaUrl,
      sources: validSources,
      categories: validCategories,
      dateAdded: media.dateAdded?.toISOString(),
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error('❌ Media Scraping workflow failed:', error);

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
