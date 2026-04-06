import { clear } from 'console';
import { fetchPageHTML, processLink } from '../packages/scraper/src';

const url = 'https://www.freeomovie.to/threesome-anal-temptations-4/';

async function main() {
  if (!url) {
    console.error('No URL set. Paste a URL into the `url` const at the top of this file.');
    process.exit(1);
  }
  // const html = await fetchPageHTML(url, undefined);
  // console.log(html);
  console.log(`Processing: ${url}\n`);
  const result = await processLink(url);
  console.log(JSON.stringify(result, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
