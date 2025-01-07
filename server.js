const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const app = express();

app.use(express.json());

const BASE_URL = 'https://ww4.123moviesfree.net';

app.get('/search', async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).send({ error: 'Query is required' });

  try {
    const searchUrl = `${BASE_URL}/search/${encodeURIComponent(query)}`;
    const response = await axios.get(searchUrl);
    const $ = cheerio.load(response.data);

    const results = [];
    $('.ml-item').each((index, element) => {
      const title = $(element).find('.mli-info h2').text();
      const link = $(element).find('a').attr('href');
      results.push({ title, link: `${BASE_URL}${link}` });
    });

    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Failed to fetch results' });
  }
});

app.get('/stream', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).send({ error: 'URL is required' });

  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const iframeUrl = $('iframe').attr('src');

    res.json({ iframeUrl });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Failed to fetch stream' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
