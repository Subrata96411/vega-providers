const axios = require('axios');
const cheerio = require('cheerio');

async function testMB() {
  const res = await axios.get('https://officialmoviebox.com/moviesDetail/lucifer-hindi-Aq2Bzbvyte1');
  const $ = cheerio.load(res.data);
  const nuxtText = $('#__NUXT_DATA__').text();
  const nuxt = JSON.parse(nuxtText);
  console.log('Nuxt length:', nuxt.length);
  const playLinks = nuxt.filter(x => typeof x === 'string' && (x.includes('m3u8') || x.includes('play') || x.includes('cdn') || x.includes('stream')));
  console.log('Candidate play strings:', playLinks.slice(0, 10));

  // Also check subjectId and detailPath in Nuxt
  const subjectId = nuxt.find(x => typeof x === 'string' && x.length === 24 && /^[a-z0-9]+$/i.test(x));
  console.log('Possible subjectId:', subjectId);

  // Check play endpoint
  try {
    const playRes = await axios.get('https://officialmoviebox.com/wefeed-h5api-bff/subject/play?subjectId=lucifer-hindi-Aq2Bzbvyte1&detailPath=lucifer-hindi-Aq2Bzbvyte1', {
      headers: {
        'Accept': 'application/json',
        'x-client-info': JSON.stringify({ timezone: 'Asia/Colombo' }),
        'Referer': 'https://officialmoviebox.com/moviesDetail/lucifer-hindi-Aq2Bzbvyte1'
      }
    });
    console.log('Play API Response:', playRes.status, playRes.data);
  } catch (e) {
    console.log('Play API Err:', e.message);
  }
}

testMB().catch(console.error);
