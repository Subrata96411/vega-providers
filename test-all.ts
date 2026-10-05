import axios from 'axios';
import * as cheerio from 'cheerio';
import * as https from 'https';
import { commonHeaders } from './providers/headers';
import { PROVIDERS } from './providers/index';
import { ProviderContext } from './providers/types';

// Use an agent that accepts self-signed or intermediate certs gracefully
const httpsAgent = new https.Agent({ rejectUnauthorized: false });
const customAxios = axios.create({
  httpsAgent,
  timeout: 10000,
});

const providerContext: ProviderContext = {
  axios: customAxios,
  cheerio,
  commonHeaders,
};

async function testAll() {
  console.log('🚀 Running Live Verification for all Vega-Phisher extensions...\n');
  const results: Record<string, { home: boolean; search: boolean; count: number; sample?: string; error?: string }> = {};

  for (const [name, provider] of Object.entries(PROVIDERS)) {
    console.log(`----------------------------------------`);
    console.log(`🔍 Testing: [${name}]`);
    results[name] = { home: false, search: false, count: 0 };

    // 1. GetHomePage
    try {
      const defaultFilter = provider.catalog?.[0]?.filter ?? '';
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);

      const posts = await provider.GetHomePage({
        filter: defaultFilter,
        page: 1,
        providerValue: name,
        providerContext,
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (Array.isArray(posts) && posts.length > 0) {
        results[name].home = true;
        results[name].count = posts.length;
        results[name].sample = posts[0].title.slice(0, 35);
        console.log(`  ✅ Home OK (${posts.length} items): "${results[name].sample}"`);
      } else {
        console.log(`  ⚠️ Home: Empty list`);
      }
    } catch (err: any) {
      console.log(`  ❌ Home Error: ${err.message}`);
      results[name].error = err.message;
    }

    // 2. GetSearchPosts
    try {
      const query = 'love';
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);

      const searchPosts = await provider.GetSearchPosts({
        searchQuery: query,
        page: 1,
        providerValue: name,
        providerContext,
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (Array.isArray(searchPosts) && searchPosts.length > 0) {
        results[name].search = true;
        console.log(`  ✅ Search OK (${searchPosts.length} items): "${searchPosts[0].title.slice(0, 35)}"`);
      } else {
        console.log(`  ⚠️ Search: 0 results`);
      }
    } catch (err: any) {
      console.log(`  ❌ Search Error: ${err.message}`);
      if (!results[name].error) results[name].error = err.message;
    }
  }

  console.log('\n================== FINAL SCORECARD ==================');
  console.table(results);
}

testAll().catch(console.error);
