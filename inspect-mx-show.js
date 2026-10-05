const axios = require('axios');
const cheerio = require('cheerio');

async function check() {
  const url = 'https://www.mxplayer.in/detail/tvshow/263122ff620b8e608aedf7269f05d9ae';
  const res = await axios.get(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
  });
  const $ = cheerio.load(res.data);
  console.log('Title:', $('title').text());
  console.log('Containers:', $('div.hs__items-container > div').length);
  $('div.hs__items-container > div').each((i, el) => {
    console.log(i, $(el).text().trim(), $(el).attr('id'));
  });

  // Check next data
  const nextData = $('#__NEXT_DATA__').text();
  if (nextData) {
    const json = JSON.parse(nextData);
    console.log('NEXT_DATA pageProps keys:', Object.keys(json.props?.pageProps || {}));
    const show = json.props?.pageProps?.show || json.props?.pageProps?.data;
    console.log('Show data:', show ? Object.keys(show) : 'none');
    if (show?.seasons) {
      console.log('Seasons array length:', show.seasons.length);
    }
  }
}

check().catch(console.error);
