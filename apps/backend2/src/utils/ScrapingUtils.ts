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

export class ScrapingUtils {
  constructor(private baseUrl: string) {}

  async getScrapingInfo() {
    const html = await this.fetchPageHTML(this.baseUrl);

    const links = this.extractLinksFromHTML(html);
    const maxPageIndex = this.getMaxPageIndex(links, this.baseUrl);
    const filteredMediaLinks = this.filterMediaLinks(links, this.baseUrl);

    return {
      maxPageIndex,
      firstPageLinks: filteredMediaLinks,
    };
  }

  private async fetchPageHTML(url: string): Promise<string> {
    const response = await fetch(url, {
      headers: DEFAULT_HEADERS,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.text();
  }

  private extractLinksFromHTML(html: string): string[] {
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

  private getMaxPageIndex(links: string[], baseScrapUrl: string): number {
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

    return maxIndex;
  }

  private filterMediaLinks(links: string[], baseScrapUrl: string) {
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

  async fetchAndExtractLinks(pageUrl: string): Promise<string[]> {
    const html = await this.fetchPageHTML(pageUrl);
    const links = this.extractLinksFromHTML(html);
    return this.filterMediaLinks(links, this.baseUrl);
  }
}
