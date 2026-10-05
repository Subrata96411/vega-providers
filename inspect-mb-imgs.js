const axios = require('axios');
const cheerio = require('cheerio');

async function checkMB() {
  const res = await axios.get('https://officialmoviebox.com/newWeb/movie', {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
  });
  const $ = cheerio.load(res.data);
  const links = $('a[href*="/moviesDetail/"]');
  console.log('Cards found:', links.length);
  links.slice(0, 5).each((i, el) => {
    const img = $(el).find('img');
    console.log(i, {
      title: $(el).find('h2, h3').text().trim() || img.attr('alt'),
      src: img.attr('src'),
      dataSrc: img.attr('data-src'),
      srcset: img.attr('srcset'),
    });
  });
}

checkMB().catch(console.error);
