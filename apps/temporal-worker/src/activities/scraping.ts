import axios from 'axios';
import * as cheerio from 'cheerio';

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

export async function fetchPageHTML(url: string): Promise<string> {
  try {
    console.log(`🌐 Fetching HTML from: ${url}`);

    const response = await axios.get(url, {
      headers: DEFAULT_HEADERS,
      timeout: 30000, // 30 second timeout
    });

    if (response.status !== 200) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log(
      `✅ Successfully fetched HTML from ${url} (${response.data.length} characters)`
    );
    return response.data;
  } catch (error) {
    console.error(`❌ Failed to fetch HTML from ${url}:`, error);
    throw new Error(
      `Failed to fetch page: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
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

export async function fetchAndExtractLinks(
  pageUrl: string,
  baseUrl: string
): Promise<string[]> {
  const html = await fetchPageHTML(pageUrl);
  const links = extractLinksFromHTML(html);
  return filterMediaLinks(links, baseUrl);
}

function filterMediaLinks(links: string[], baseScrapUrl: string) {
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
