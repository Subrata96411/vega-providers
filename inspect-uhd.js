const axios = require('axios');
const cheerio = require('cheerio');

async function check() {
  const res = await axios.get('https://uhdmovies.my', {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
  });
  const $ = cheerio.load(res.data);
  const el = $('article.gridlove-post').first();
  console.log('HTML:\n', el.html());
}

check().catch(console.error);
