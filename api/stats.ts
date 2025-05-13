import { VercelRequest, VercelResponse } from '@vercel/node';
import RSSParser from 'rss-parser';
import * as ejs from 'ejs';
import fs from 'fs';
import path from 'path';
import cron from 'node-cron';

const parser = new RSSParser({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'Accept-Encoding': 'gzip, deflate, br, zstd',
    'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
    'Cache-Control': 'max-age=0',
    'Upgrade-Insecure-Requests': '1'
  }
});

async function fetchRSSFeed(url: string) {
  const feed = await parser.parseURL(url);
  let totalPosts = 0;
  let totalViews = 0; // Assuming views are calculated elsewhere
  let totalComments = 0; // Assuming comments are calculated elsewhere

  feed.items.forEach((item: any) => {
    console.log(item.title, item.link, item.pubDate);
    totalPosts++;
    // Additional logic to calculate views and comments if needed
  });

  return { totalPosts, totalViews, totalComments };
}

export default async (req: VercelRequest, res: VercelResponse) => {
  const { blogName } = req.query;
  const rssUrl = `https://${blogName}.tistory.com/rss`;
  const { totalPosts, totalViews, totalComments } = await fetchRSSFeed(rssUrl);

  const templatePath = path.join(__dirname, '../templates/badge.ejs');
  const template = fs.readFileSync(templatePath, 'utf-8');
  const svg = ejs.render(template, { totalPosts, totalViews, totalComments });

  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'max-age=600, s-maxage=86400, stale-while-revalidate=86400');
  res.status(200).send(svg);

  // Schedule RSS feed updates every hour
  cron.schedule('0 * * * *', () => {
    fetchRSSFeed(rssUrl);
  });
}; 