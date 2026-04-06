import * as cheerio from 'cheerio';
import { parse } from 'date-fns';
import { ProxyAgent } from 'undici';

export interface ScrapedMedia {
  name: string | undefined;
  description: string | null | undefined;
  thumbnailUrl: string | undefined;
  sources: { source: string; url: string }[];
  categories: string[];
  dateAdded: Date | null;
  duration: string | null;
  cast: string[];
  rawDescriptionDiv: string;
}

export const DEFAULT_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  Accept:
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5',
  'Accept-Encoding': 'gzip, deflate',
  DNT: '1',
  Connection: 'keep-alive',
  'Upgrade-Insecure-Requests': '1',
};

export function extractLinksFromHTML(html: string): string[] {
  const $ = cheerio.load(html);
  const links: string[] = [];

  $('a[href]').each((_, element) => {
    const href = $(element).attr('href');
    if (href) {
      links.push(href);
    }
  });

  return links;
}

export function getMediaLinkThumbnailAndName(
  $: cheerio.CheerioAPI
): { thumbnailUrl: string; name: string } | null {
  const thumbnailImg = $('img.rmbd');

  const thumbnailUrl = thumbnailImg.attr('src');

  const altText = thumbnailImg.attr('alt');

  if (!thumbnailUrl) {
    return null;
  }

  let name = altText || '';

  try {
    name = decodeURIComponent(name);
  } catch (error) {
    console.error('Failed to decode alt text:', error);
  }

  return { thumbnailUrl, name };
}

export function getMediaLinkInfo($: cheerio.CheerioAPI): {
  description: string | null;
  dateAdded: Date | null;
  duration: string | null;
  cast: string[];
  rawDescriptionDiv: string;
} {
  const descriptionDiv = $('div.the_description');
  const firstParagraph = descriptionDiv.find('p:not(.hideUrl)').first();
  const paragraphHtml = firstParagraph.html() || '';

  const parts = paragraphHtml.split(/<br\s*\/?>/i);

  const stripHtml = (html: string) => $('<div>').html(html).text().trim();

  const description = parts[0] ? stripHtml(parts[0]) || null : null;

  let duration: string | null = null;
  let cast: string[] = [];

  for (const part of parts) {
    const text = stripHtml(part);
    if (text.startsWith('Duration:')) {
      duration = text.replace('Duration:', '').trim();
    } else if (text.startsWith('Cast:')) {
      cast = text
        .replace('Cast:', '')
        .split(',')
        .map((name) => name.trim())
        .filter(Boolean);
    }
  }

  const dateAddedElement = $('.about-content .data-row');
  const rawAddedOnDate = dateAddedElement
    .first()
    .text()
    .replace('Added on:', '')
    .trim();
  const dateAdded = rawAddedOnDate
    ? new Date(rawAddedOnDate)
    : null;

  return { description, dateAdded, duration, cast, rawDescriptionDiv: descriptionDiv.toString() };
}

export function getMediaSources(
  $: cheerio.CheerioAPI
): { source: string; url: string }[] {
  const linkTabs = $('#link-tabs');
  const sources: { source: string; url: string }[] = [];

  linkTabs.find('li a').each((_index, element) => {
    const source = $(element).text().trim();
    const url = $(element).attr('href');

    if (source && url) {
      sources.push({ source, url });
    }
  });

  return sources;
}

export function getMediaLinkCategories($: cheerio.CheerioAPI): string[] {
  const categories: string[] = [];

  $('a[rel="category"]').each((_index, element) => {
    const categoryText = $(element).text().trim();
    if (categoryText) {
      categories.push(categoryText);
    }
  });

  return categories;
}

async function logFetchAttempt(url: string, attempt: number, proxyAgent?: ProxyAgent) {
  if (proxyAgent) {
    try {
      const ipResponse = await fetch('https://api.ipify.org?format=json', {
        // @ts-ignore
        dispatcher: proxyAgent,
        signal: AbortSignal.timeout(5000),
      });
      const { ip } = (await ipResponse.json()) as { ip: string };
      console.log(
        `🌐 Fetching HTML from: ${url} (Attempt ${attempt}) [Proxy IP: ${ip}]`
      );
    } catch (e) {
      console.log(
        `🌐 Fetching HTML from: ${url} (Attempt ${attempt}) [Proxy IP Check Failed]`
      );
    }
  } else {
    console.log(`🌐 Fetching HTML from: ${url} (Attempt ${attempt}) [No Proxy]`);
  }
}

export async function fetchPageHTML(
  url: string,
  proxyAgent?: ProxyAgent,
  maxRetries = 3,
  backoffMs = 10000
): Promise<string> {
  const DEFAULT_HEADERS = {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    Accept:
      'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Accept-Encoding': 'gzip, deflate',
    DNT: '1',
    Connection: 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
  };

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await logFetchAttempt(url, attempt, proxyAgent);

      const response = await fetch(url, {
        headers: DEFAULT_HEADERS,
        // @ts-ignore - dispatcher is an undici extension to fetch
        dispatcher: proxyAgent,
        signal: AbortSignal.timeout(60000), // 60 second timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.text();
    } catch (error) {
      const is403 =
        error instanceof Error &&
        (error.message.includes('403') ||
          (error as any).status === 403 ||
          (error as any).response?.status === 403);

      if (is403 && attempt < maxRetries) {
        console.warn(`⚠️ Received 403 for ${url}. Waiting 10s for proxy rotation...`);
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
        continue;
      }

      console.error(`❌ Failed to fetch HTML from ${url}:`, error);
      throw new Error(
        `Failed to fetch page: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
  throw new Error('Maximum retries exceeded');
}

export async function getMaxPageIndex(
  html: string,
  baseScrapUrl: string
): Promise<number> {
  try {
    console.log(
      `🔍 Analyzing HTML to find max page index for base URL: ${baseScrapUrl}`
    );

    const links = extractLinksFromHTML(html);
    console.log(`📋 Found ${links.length} links in HTML`);

    const pagePattern = /\/page\/(\d+)\/$/;
    let maxIndex = 0;

    for (const link of links) {
      if (link.startsWith(baseScrapUrl)) {
        const match = link.match(pagePattern);
        if (match) {
          const index = parseInt(match[1], 10);
          if (index > maxIndex) {
            maxIndex = index;
          }
        }
      }
    }

    console.log(`📊 Max page index found: ${maxIndex}`);
    return maxIndex;
  } catch (error) {
    console.error('❌ Failed to analyze max page index:', error);
    throw new Error(
      `Failed to analyze HTML: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

export function filterMediaLinks(links: string[], baseScrapUrl: string) {
  const baseUrl = new URL(baseScrapUrl).origin;
  const uniqueLinks = new Set<string>();
  const excludePaths = ['/contact-us', '/legal-notice', '/page', '/category'];

  for (const link of links) {
    if (link.startsWith(baseUrl)) {
      // Exclude base URL and base URL with trailing slash
      if (link === baseUrl || link === `${baseUrl}/`) {
        continue;
      }

      const shouldExclude = excludePaths.some((path) =>
        link.includes(`${baseUrl}${path}`)
      );

      if (!shouldExclude) {
        uniqueLinks.add(link);
      }
    }
  }

  return Array.from(uniqueLinks);
}

export async function fetchAndExtractLinks(
  pageUrl: string,
  baseScrapUrl: string,
  proxyAgent?: ProxyAgent
): Promise<string[]> {
  const html = await fetchPageHTML(pageUrl, proxyAgent);
  const links = extractLinksFromHTML(html);
  return filterMediaLinks(links, baseScrapUrl);
}

export async function processLink(
  link: string,
  proxyAgent?: ProxyAgent
): Promise<ScrapedMedia> {
  const html = await fetchPageHTML(link, proxyAgent);

  const $ = cheerio.load(html);
  const thumbnailNameResult = getMediaLinkThumbnailAndName($);

  if (thumbnailNameResult) {
    const { thumbnailUrl, name } = thumbnailNameResult;
    console.log(`Thumbnail URL: ${thumbnailUrl}`);
    console.log(`Name: ${name}`);
  } else {
    console.log('No thumbnail found with class "rmbd"');
  }

  const mediaInfo = getMediaLinkInfo($);
  const mediaCategories = getMediaLinkCategories($);

  if (mediaCategories.length > 0) {
    console.log(`Categories: ${mediaCategories.join(', ')}`);
  } else {
    console.log('No categories found');
  }

  if (mediaInfo) {
    console.log(`Description: ${mediaInfo.description}`);
  } else {
    console.log('No description found');
  }

  const mediaSources = getMediaSources($);

  if (mediaSources.length > 0) {
    console.log(`Found ${mediaSources.length} media sources:`);
    mediaSources.forEach((source, index) => {
      console.log(`${index + 1}. ${source.source}: ${source.url}`);
    });
  } else {
    console.log('No media sources found');
  }

  return {
    name: thumbnailNameResult?.name,
    description: mediaInfo?.description,
    thumbnailUrl: thumbnailNameResult?.thumbnailUrl,
    sources: mediaSources,
    categories: mediaCategories,
    dateAdded: mediaInfo.dateAdded,
    duration: mediaInfo.duration,
    cast: mediaInfo.cast,
    rawDescriptionDiv: mediaInfo.rawDescriptionDiv,
  };
}