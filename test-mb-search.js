const axios = require('axios');
const cheerio = require('cheerio');

async function testMBSearch() {
  const url = 'https://officialmoviebox.com/newWeb/searchResult?keyword=Batman';
  const res = await axios.get(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
  });
  const $ = cheerio.load(res.data);
  console.log('Title:', $('title').text());
  console.log('MoviesDetail links:', $('a[href*="/moviesDetail/"]').length);
  $('a[href*="/moviesDetail/"]').slice(0, 5).each((i, el) => {
    const card = $(el);
    const title = card.find('h2, h3').first().text().trim() || card.find('img').attr('alt') || card.attr('title') || '';
    const href = card.attr('href');
    const img = card.find('img').attr('src') || card.find('img').attr('data-src') || '';
    console.log(`[${i}] Title: "${title}" | Link: "${href}" | Img: "${img}"`);
  });
}

testMBSearch().catch(console.error);
