import { randomUUID } from 'crypto';
import * as cheerio from 'cheerio';
import { env } from '../config/index.js';
import { mediaDatabase } from '../database/media.js';
import { sourcesDatabase } from '../database/sources.js';
import { jobsDatabase } from '../database/jobs.js';
// Common HTTP headers for web scraping
const DEFAULT_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Accept-Encoding': 'gzip, deflate',
    DNT: '1',
    Connection: 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
};
class ScrapingService {
    activeJobIds = new Set();
    constructor() {
        // Initialize recovery on startup
        this.initializeRecovery();
    }
    startScraping(request) {
        if (!env.BASE_SCRAPE_URL) {
            return {
                error: 'BASE_SCRAPE_URL environment variable is not configured',
            };
        }
        // Create persistent job
        const job = jobsDatabase.createJob({
            baseUrl: env.BASE_SCRAPE_URL,
            maxPages: 10, // Will be updated when we discover actual max pages
            forceMode: request.options?.force || false,
            waitTime: request.options?.waitTime || 1000,
        });
        // Log job creation
        jobsDatabase.logActivity(job.id, 'info', 'Job created', {
            baseUrl: env.BASE_SCRAPE_URL,
            forceMode: job.forceMode,
        });
        // Start the scraping process asynchronously
        this.executeScraping(job.id, request).catch((error) => {
            jobsDatabase.updateJobStatus(job.id, 'failed', error.message);
            jobsDatabase.logActivity(job.id, 'error', 'Job failed', { error: error.message });
            this.activeJobIds.delete(job.id);
        });
        return job;
    }
    getJob(jobId) {
        return jobsDatabase.getJobById(jobId);
    }
    getAllJobs() {
        return jobsDatabase.getAllJobs();
    }
    getActiveJobs() {
        return jobsDatabase.getActiveJobs();
    }
    // Job control methods
    pauseJob(jobId) {
        const job = jobsDatabase.getJobById(jobId);
        if (!job || job.status !== 'running') {
            return false;
        }
        jobsDatabase.updateJobStatus(jobId, 'paused');
        jobsDatabase.logActivity(jobId, 'info', 'Job paused by user');
        return true;
    }
    resumeJob(jobId) {
        const job = jobsDatabase.getJobById(jobId);
        if (!job || job.status !== 'paused') {
            return false;
        }
        jobsDatabase.updateJobStatus(jobId, 'running');
        jobsDatabase.logActivity(jobId, 'info', 'Job resumed by user');
        // Resume execution from where it left off
        this.resumeScraping(jobId).catch((error) => {
            jobsDatabase.updateJobStatus(jobId, 'failed', error.message);
            jobsDatabase.logActivity(jobId, 'error', 'Job failed on resume', { error: error.message });
            this.activeJobIds.delete(jobId);
        });
        return true;
    }
    cancelJob(jobId) {
        const job = jobsDatabase.getJobById(jobId);
        if (!job || ['completed', 'failed', 'cancelled'].includes(job.status)) {
            return false;
        }
        jobsDatabase.updateJobStatus(jobId, 'cancelled', 'Job cancelled by user');
        jobsDatabase.logActivity(jobId, 'info', 'Job cancelled by user');
        this.activeJobIds.delete(jobId);
        return true;
    }
    async executeScraping(jobId, request) {
        const job = jobsDatabase.getJobById(jobId);
        if (!job)
            return;
        if (!env.BASE_SCRAPE_URL) {
            jobsDatabase.updateJobStatus(jobId, 'failed', 'BASE_SCRAPE_URL environment variable is not configured');
            jobsDatabase.logActivity(jobId, 'error', 'BASE_SCRAPE_URL not configured');
            return;
        }
        try {
            // Update job status to running
            jobsDatabase.updateJobStatus(jobId, 'running');
            this.activeJobIds.add(jobId);
            jobsDatabase.logActivity(jobId, 'info', `Starting scraping job for URL: ${env.BASE_SCRAPE_URL}`);
            // Fetch and extract links
            const html = await this.fetchPageHTML(env.BASE_SCRAPE_URL);
            const $ = cheerio.load(html);
            const title = $('title').text();
            const links = extractLinksFromHTML(html);
            const maxPageIndex = getMaxPageIndex(links, env.BASE_SCRAPE_URL);
            const filteredMediaLinks = filterMediaLinks(links, env.BASE_SCRAPE_URL);
            // Update job with discovered information
            jobsDatabase.updateJobProgress(jobId, {
                totalPages: maxPageIndex,
                linksTotal: filteredMediaLinks.length,
            });
            jobsDatabase.logActivity(jobId, 'info', `Found ${filteredMediaLinks.length} media links across ${maxPageIndex} pages`, {
                title,
                totalLinks: links.length,
                maxPages: maxPageIndex,
            });
            console.log(`Page title: ${title}`);
            console.log(`Found ${links.length} links`);
            console.log('\n=== All Links Found ===');
            filteredMediaLinks.forEach((link, index) => {
                console.log(`${index + 1}. ${link}`);
            });
            console.log('MAX PAGE', maxPageIndex);
            console.log('=== End Links ===\n');
            await handleMediaLinks(filteredMediaLinks, env.BASE_SCRAPE_URL, maxPageIndex, request.options?.force || false, jobId);
            // Simulate processing time
            await this.delay(request.options?.waitTime || 1000);
            jobsDatabase.updateJobStatus(jobId, 'completed');
            jobsDatabase.logActivity(jobId, 'info', 'Job completed successfully');
            console.log(`Scraping job ${jobId} completed successfully`);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            jobsDatabase.updateJobStatus(jobId, 'failed', errorMessage);
            jobsDatabase.logActivity(jobId, 'error', 'Job failed', { error: errorMessage });
            console.error(`Scraping job ${jobId} failed:`, errorMessage);
        }
        finally {
            this.activeJobIds.delete(jobId);
        }
    }
    // Recovery methods
    async initializeRecovery() {
        const activeJobs = jobsDatabase.getActiveJobs();
        for (const job of activeJobs) {
            if (job.status === 'running') {
                // Mark interrupted jobs as paused
                jobsDatabase.updateJobStatus(job.id, 'paused', 'Server restart - job was running');
                jobsDatabase.logActivity(job.id, 'warning', 'Job paused due to server restart');
            }
        }
        console.log(`📊 Recovery: Found ${activeJobs.length} active jobs, marked running jobs as paused`);
    }
    async resumeScraping(jobId) {
        const job = jobsDatabase.getJobById(jobId);
        if (!job)
            return;
        jobsDatabase.logActivity(jobId, 'info', 'Resuming job from saved state');
        try {
            // Resume from where we left off
            // This would need more sophisticated state management for full resume capability
            // For now, we'll restart the job but skip already processed links
            const request = {
                options: {
                    force: job.forceMode,
                    waitTime: job.waitTime,
                },
            };
            await this.executeScraping(jobId, request);
        }
        catch (error) {
            throw error;
        }
    }
    delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
    async fetchPageHTML(url) {
        return fetchPageHTML(url);
    }
    // Cleanup completed jobs older than 24 hours
    cleanupOldJobs() {
        return jobsDatabase.cleanupOldJobs();
    }
}
// Export singleton instance
export const scrapingService = new ScrapingService();
function getMaxPageIndex(links, baseScrapUrl) {
    const pagePattern = /\/page\/(\d+)\/$/;
    let maxIndex = 0;
    for (const link of links) {
        const match = link.match(pagePattern);
        if (match) {
            const pageIndex = parseInt(match[1], 10);
            if (pageIndex > maxIndex) {
                maxIndex = pageIndex;
            }
        }
    }
    return maxIndex;
}
function filterMediaLinks(links, baseScrapUrl) {
    const baseUrl = new URL(baseScrapUrl).origin;
    const uniqueLinks = new Set();
    const excludePaths = ['/contact-us', '/legal-notice', '/page', '/category'];
    for (const link of links) {
        if (link.startsWith(baseUrl)) {
            // Exclude base URL and base URL with trailing slash
            if (link === baseUrl || link === `${baseUrl}/`) {
                continue;
            }
            const shouldExclude = excludePaths.some((path) => link.includes(`${baseUrl}${path}`));
            if (!shouldExclude) {
                uniqueLinks.add(link);
            }
        }
    }
    return Array.from(uniqueLinks);
}
async function handleMediaLinks(mediaLinks, baseUrl, maxPageIndex, force = false, jobId) {
    console.log(`\n=== Processing Media Links ===`);
    console.log(`Processing ${mediaLinks.length} links from first page`);
    console.log(`Max page index: ${maxPageIndex}`);
    console.log(`Force mode: ${force ? 'ON' : 'OFF'}`);
    if (!force) {
        // Check if all links from first page already exist
        const firstPageExistingCount = mediaLinks.filter(link => mediaDatabase.pageUrlExists(link)).length;
        if (firstPageExistingCount === mediaLinks.length) {
            console.log(`🛑 All ${mediaLinks.length} links from first page already exist in database - skipping all processing`);
            return;
        }
        console.log(`📊 ${firstPageExistingCount}/${mediaLinks.length} links already exist in database`);
    }
    else {
        console.log(`⚡ Force mode enabled - bypassing early termination checks`);
    }
    // Process all links from the first page
    for (const link of mediaLinks) {
        await processLink(link, force, jobId);
    }
    // Update current page progress
    if (jobId) {
        jobsDatabase.updateJobProgress(jobId, { currentPage: 1 });
    }
    // Process additional pages if they exist
    if (maxPageIndex > 1) {
        console.log(`\n=== Processing Additional Pages (2-${maxPageIndex}) ===`);
        // Process pages sequentially to allow early termination
        for (let pageIndex = 2; pageIndex <= maxPageIndex; pageIndex++) {
            if (jobId) {
                jobsDatabase.updateJobProgress(jobId, { currentPage: pageIndex });
            }
            const shouldStop = await processPage(pageIndex, baseUrl, force, jobId);
            if (!force && shouldStop) {
                console.log(`🛑 Stopping page processing at page ${pageIndex} - all links already exist`);
                if (jobId) {
                    jobsDatabase.logActivity(jobId, 'info', `Early termination at page ${pageIndex} - all links already exist`);
                }
                break;
            }
        }
    }
    console.log(`\n=== Finished Processing All Pages ===`);
}
async function processLink(link, force = false, jobId) {
    try {
        // Check if link already exists in database (unless force mode is enabled)
        if (!force && mediaDatabase.pageUrlExists(link)) {
            console.log(`⏭️ Skipped ${link} - already exists in database`);
            // Update progress
            if (jobId) {
                const job = jobsDatabase.getJobById(jobId);
                if (job) {
                    jobsDatabase.updateJobProgress(jobId, {
                        linksSkipped: job.linksSkipped + 1
                    });
                }
            }
            return;
        }
        console.log(`Processing link: ${link}`);
        const html = await fetchPageHTML(link);
        const $ = cheerio.load(html);
        const thumbnailNameResult = getMediaLinkThumbnailAndName($);
        if (thumbnailNameResult) {
            const { thumbnailUrl, name } = thumbnailNameResult;
            console.log(`Thumbnail URL: ${thumbnailUrl}`);
            console.log(`Name: ${name}`);
        }
        else {
            console.log('No thumbnail found with class "rmbd"');
        }
        const mediaInfo = getMediaLinkInfo($);
        if (mediaInfo) {
            console.log(`Description: ${mediaInfo.description}`);
        }
        else {
            console.log('No description found');
        }
        const mediaSources = getMediaSources($);
        if (mediaSources.length > 0) {
            console.log(`Found ${mediaSources.length} media sources:`);
            mediaSources.forEach((source, index) => {
                console.log(`${index + 1}. ${source.source}: ${source.url}`);
            });
        }
        else {
            console.log('No media sources found');
        }
        const media = {
            name: thumbnailNameResult?.name,
            description: mediaInfo?.description,
            thumbnailUrl: thumbnailNameResult?.thumbnailUrl,
            sources: mediaSources,
        };
        // Store to database if we have the required data
        storeMedia(media, mediaSources, link);
        // Update progress
        if (jobId) {
            const job = jobsDatabase.getJobById(jobId);
            if (job) {
                jobsDatabase.updateJobProgress(jobId, {
                    linksProcessed: job.linksProcessed + 1
                });
            }
        }
    }
    catch (error) {
        console.error(`Error processing link ${link}:`, error);
    }
}
function storeMedia(media, mediaSources, link) {
    if (media.name &&
        media.description &&
        media.thumbnailUrl &&
        mediaSources.length > 0) {
        try {
            const mediaId = randomUUID();
            // Store media record
            mediaDatabase.addMedia({
                id: mediaId,
                name: media.name,
                description: media.description,
                thumbnailUrl: media.thumbnailUrl,
                pageUrl: link,
            });
            // Store sources
            const sources = mediaSources.map((source) => ({
                id: randomUUID(),
                mediaId: mediaId,
                sourceName: source.source,
                url: source.url,
            }));
            sourcesDatabase.addSources(sources);
            console.log(`✅ Saved media "${media.name}" with ${sources.length} sources to database`);
        }
        catch (error) {
            console.error('❌ Failed to save media to database:', error);
        }
    }
    else {
        console.log('⚠️ Missing required data, not saving to database');
    }
}
function getMediaLinkThumbnailAndName($) {
    const thumbnailImg = $('img.rmbd, noscript img.rmbd').first();
    const thumbnailUrl = thumbnailImg.attr('data-src');
    const altText = thumbnailImg.attr('alt');
    if (!thumbnailUrl) {
        return null;
    }
    const name = altText ? decodeURIComponent(altText) : '';
    return { thumbnailUrl, name };
}
function getMediaLinkInfo($) {
    const descriptionDiv = $('div.the_description');
    const firstParagraph = descriptionDiv.find('p').first();
    const description = firstParagraph.text().trim();
    if (!description) {
        return null;
    }
    return { description };
}
function getMediaSources($) {
    const linkTabs = $('#link-tabs');
    const sources = [];
    linkTabs.find('li a').each((index, element) => {
        const source = $(element).text().trim();
        const url = $(element).attr('href');
        if (source && url) {
            sources.push({ source, url });
        }
    });
    return sources;
}
// Utility Functions
async function fetchPageHTML(url) {
    try {
        console.log(`Fetching URL: ${url}`);
        const response = await fetch(url, { headers: DEFAULT_HEADERS });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const html = await response.text();
        console.log(`Successfully fetched ${html.length} characters from ${url}`);
        return html;
    }
    catch (error) {
        console.error(`Error fetching ${url}:`, error);
        throw error;
    }
}
function extractLinksFromHTML(html) {
    const $ = cheerio.load(html);
    const links = [];
    $('a').each((index, element) => {
        const href = $(element).attr('href');
        if (href) {
            links.push(href);
        }
    });
    return links;
}
async function fetchAndExtractLinks(url, baseUrl) {
    try {
        const html = await fetchPageHTML(url);
        const allLinks = extractLinksFromHTML(html);
        return filterMediaLinks(allLinks, baseUrl);
    }
    catch (error) {
        console.error(`Error fetching and extracting links from ${url}:`, error);
        return [];
    }
}
async function processPage(pageIndex, baseUrl, force = false, jobId) {
    const pageUrl = `${baseUrl}page/${pageIndex}`;
    console.log(`\nFetching page ${pageIndex}: ${pageUrl}`);
    const pageMediaLinks = await fetchAndExtractLinks(pageUrl, baseUrl);
    console.log(`Found ${pageMediaLinks.length} media links on page ${pageIndex}`);
    if (!force) {
        // Check if all links already exist
        if (pageMediaLinks.length > 0) {
            const existingCount = pageMediaLinks.filter(link => mediaDatabase.pageUrlExists(link)).length;
            if (existingCount === pageMediaLinks.length) {
                console.log(`🛑 All ${pageMediaLinks.length} links from page ${pageIndex} already exist - stopping further page processing`);
                return true; // Signal to stop processing further pages
            }
            console.log(`📊 ${existingCount}/${pageMediaLinks.length} links already exist on page ${pageIndex}`);
        }
    }
    // Process all links from this page sequentially to avoid overwhelming the target server
    for (const link of pageMediaLinks) {
        await processLink(link, force, jobId);
    }
    return false; // Continue processing pages
}
