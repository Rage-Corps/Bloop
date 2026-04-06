import {
  fetchPageHTML as scraperFetchPageHTML,
  getMaxPageIndex as scraperGetMaxPageIndex,
  fetchAndExtractLinks as scraperFetchAndExtractLinks,
  filterMediaLinks as scraperFilterMediaLinks,
  processLink as scraperProcessLink,
} from '@bloop/scraper';
import { ProxyAgent } from 'undici';
import { Connection, Client } from '@temporalio/client';

const PROXY_URL = process.env.PROXY_URL;
const proxyAgent = PROXY_URL ? new ProxyAgent(PROXY_URL) : undefined;

export async function fetchPageHTML(url: string) {
  return scraperFetchPageHTML(url, proxyAgent);
}

export async function getMaxPageIndex(html: string, baseScrapUrl: string) {
  return scraperGetMaxPageIndex(html, baseScrapUrl);
}

export async function filterMediaLinks(links: string[], baseScrapUrl: string) {
  return scraperFilterMediaLinks(links, baseScrapUrl);
}

export async function fetchAndExtractLinks(pageUrl: string, baseScrapUrl: string) {
  return scraperFetchAndExtractLinks(pageUrl, baseScrapUrl, proxyAgent);
}

export async function processLink(link: string) {
  return scraperProcessLink(link, proxyAgent);
}

export async function listRunningScrapingWorkflows(): Promise<number> {
  try {
    const temporalAddress = process.env.TEMPORAL_ADDRESS || 'localhost:7233';
    const namespace = process.env.TEMPORAL_NAMESPACE || 'default';

    const connection = await Connection.connect({ address: temporalAddress });
    const client = new Client({ connection, namespace });

    const workflows = client.workflow.list({
      query: 'WorkflowType = "scrapingWorkflow" AND ExecutionStatus = "Running"',
    });

    let count = 0;
    for await (const _ of workflows) {
      count++;
    }

    await connection.close();
    return count;
  } catch (error) {
    console.error('Failed to list running scraping workflows:', error);
    return 0;
  }
}
