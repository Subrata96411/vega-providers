import axios from 'axios';
import * as cheerio from 'cheerio';
import * as https from 'https';
import { commonHeaders } from './providers/headers';
import { MovieBoxProvider } from './providers/movieBox/index';
import { MXPlayerProvider } from './providers/mxPlayer/index';
import { ProviderContext } from './providers/types';

const httpsAgent = new https.Agent({ rejectUnauthorized: false });
const customAxios = axios.create({
  httpsAgent,
  timeout: 15000,
});

const providerContext: ProviderContext = {
  axios: customAxios,
  cheerio,
  commonHeaders,
};

async function testStreams() {
  console.log('🎥 Testing Stream Extraction for MovieBox and MXPlayer...\n');

  // ==========================================
  // 1. TEST MX PLAYER
  // ==========================================
  console.log('----------------------------------------');
  console.log('🧪 Testing MX Player Stream Extraction...');
  console.log('----------------------------------------');
  try {
    // Get a post from HomePage
    const homePosts = await MXPlayerProvider.GetHomePage({
      filter: 'hindi_movies',
      page: 1,
      providerValue: 'mxPlayer',
      providerContext,
      signal: new AbortController().signal,
    });

    if (!homePosts || homePosts.length === 0) {
      throw new Error('No posts found on MX Player homepage');
    }

    const testPost = homePosts[0];
    console.log(`  ➔ Selected Title: "${testPost.title}" (${testPost.link})`);

    // Get Meta (Info)
    console.log('  ➔ Fetching Info / Episodes...');
    const info = await MXPlayerProvider.GetInfo({
      link: testPost.link,
      signal: new AbortController().signal,
      providerContext,
    });

    console.log(`  ➔ Info resolved. Title: "${info.title}", Seasons/Links: ${info.linkList?.length}`);

    const directLink = info.linkList?.[0]?.directLinks?.[0]?.link;
    if (!directLink) {
      throw new Error('No playable stream link found in MX Player Info linkList');
    }

    console.log(`  ➔ Direct Playback Link: ${directLink}`);

    // Get Stream
    console.log('  ➔ Resolving actual video streams (HLS/DASH/MP4)...');
    const streams = await MXPlayerProvider.GetStream({
      link: directLink,
      type: info.type,
      signal: new AbortController().signal,
      providerContext,
    });

    console.log(`  ➔ Found ${streams?.length || 0} stream(s):`);
    for (const s of streams || []) {
      console.log(`     • [${s.server}] (${s.type}): ${s.link.slice(0, 80)}...`);
      // Ping stream URL to ensure HTTP 200
      try {
        const streamHead = await customAxios.get(s.link, {
          headers: { ...commonHeaders, Range: 'bytes=0-100' },
          timeout: 7000,
        });
        console.log(`       ✅ Stream URL alive! HTTP Status: ${streamHead.status}`);
      } catch (err: any) {
        console.log(`       ⚠️ Stream URL check: ${err.message}`);
      }
    }
  } catch (err: any) {
    console.log(`  ❌ MX Player Stream test failed: ${err.message}`);
  }

  // ==========================================
  // 2. TEST MOVIEBOX
  // ==========================================
  console.log('\n----------------------------------------');
  console.log('🧪 Testing MovieBox Stream Extraction...');
  console.log('----------------------------------------');
  try {
    const homePosts = await MovieBoxProvider.GetHomePage({
      filter: '/wefeed-h5api-bff/subject/trending',
      page: 1,
      providerValue: 'movieBox',
      providerContext,
      signal: new AbortController().signal,
    });

    if (!homePosts || homePosts.length === 0) {
      throw new Error('No posts found on MovieBox homepage');
    }

    const testPost = homePosts[0];
    console.log(`  ➔ Selected Title: "${testPost.title}" (${testPost.link})`);

    // Get Meta
    console.log('  ➔ Fetching Info...');
    const info = await MovieBoxProvider.GetInfo({
      link: testPost.link,
      signal: new AbortController().signal,
      providerContext,
    });

    console.log(`  ➔ Info resolved. Title: "${info.title}"`);
    const directLink = info.linkList?.[0]?.directLinks?.[0]?.link;
    console.log(`  ➔ Direct Playback Link: ${directLink}`);

    // Get Stream
    const streams = await MovieBoxProvider.GetStream({
      link: directLink || testPost.link,
      type: info.type,
      signal: new AbortController().signal,
      providerContext,
    });

    console.log(`  ➔ Found ${streams?.length || 0} stream(s):`);
    for (const s of streams || []) {
      console.log(`     • [${s.server}] (${s.type}): ${s.link}`);
    }
  } catch (err: any) {
    console.log(`  ❌ MovieBox Stream test failed: ${err.message}`);
  }
}

testStreams().catch(console.error);
