import { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';
import * as qs from 'querystring';
import * as ejs from 'ejs';
import fs from 'fs';
import path from 'path';

const TISTORY_CLIENT_ID = process.env.TISTORY_CLIENT_ID;
const TISTORY_CLIENT_SECRET = process.env.TISTORY_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

async function getAccessToken(refreshToken: string): Promise<string> {
  const response = await axios.post('https://www.tistory.com/oauth/access_token', qs.stringify({
    client_id: TISTORY_CLIENT_ID,
    client_secret: TISTORY_CLIENT_SECRET,
    redirect_uri: REDIRECT_URI,
    grant_type: 'refresh_token',
    refresh_token: refreshToken
  }));
  return response.data.access_token;
}

async function fetchPosts(blogName: string, page: number, accessToken: string) {
  const response = await axios.get(`https://www.tistory.com/apis/post/list?blogName=${blogName}&page=${page}&output=json&access_token=${accessToken}`);
  return response.data;
}

async function fetchViewCount(postUrl: string): Promise<number> {
  const response = await axios.get(postUrl);
  const match = response.data.match(/<span class="view-count">(\d+)<\/span>/);
  return match ? parseInt(match[1], 10) : 0;
}

export default async (req: VercelRequest, res: VercelResponse) => {
  const { blogName } = req.query;
  let accessToken = await getAccessToken('your_refresh_token'); // Replace with actual refresh token logic
  let page = 1;
  let totalPosts = 0;
  let totalViews = 0;
  let totalComments = 0;

  while (true) {
    const data = await fetchPosts(blogName as string, page, accessToken);
    if (!data.tistory || !data.tistory.item || data.tistory.item.posts.length === 0) break;

    totalPosts += data.tistory.item.posts.length;
    for (const post of data.tistory.item.posts) {
      totalViews += await fetchViewCount(post.postUrl);
      totalComments += post.comments;
    }
    page++;
  }

  const templatePath = path.join(__dirname, '../templates/badge.ejs');
  const template = fs.readFileSync(templatePath, 'utf-8');
  const svg = ejs.render(template, { totalPosts, totalViews, totalComments });

  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'max-age=600, s-maxage=86400, stale-while-revalidate=86400');
  res.status(200).send(svg);
}; 