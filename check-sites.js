const axios = require('axios');
const cheerio = require('cheerio');

async function testSites() {
  const sites = [
    { name: 'HDHub4u', url: 'https://new1.hdhub4u.free' },
    { name: 'KissKh', url: 'https://kisskh.is/api/DramaList/Drama/KDrama/list?pageSize=5&page=1' },
    { name: 'MovieBox', url: 'https://officialmoviebox.com' },
    { name: 'AnimePahe', url: 'https://animepahe.pw/api?m=airing&page=1' },
    { name: 'KickAssAnime', url: 'https://kaa.lt' },
  ];

  for (const s of sites) {
    try {
      const res = await axios.get(s.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
          'Referer': 'https://google.com'
        },
        timeout: 8000
      });
      console.log(`[PASS] ${s.name}: Status ${res.status}, Type: ${typeof res.data}`);
    } catch (e) {
      console.log(`[FAIL] ${s.name}: ${e.message}`);
    }
  }
}

testSites().catch(console.error);
