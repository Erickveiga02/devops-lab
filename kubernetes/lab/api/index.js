const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;
const OPENWEATHER_KEY = process.env.OPENWEATHER_API_KEY;

if (!OPENWEATHER_KEY) {
  console.warn('WARNING: OPENWEATHER_API_KEY não setado. A API externa falhará se não houver chave.');
}

// Simple in-memory cache: { key: { ts: timestamp, data: ... } }
const cache = {};
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos

function cacheGet(key) {
  const entry = cache[key];
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL_MS) {
    delete cache[key];
    return null;
  }
  return entry.data;
}

function cacheSet(key, data) {
  cache[key] = { ts: Date.now(), data };
}

async function fetchWeatherByCity(city, units = 'metric', lang = 'pt_br') {
  const key = `city:${city}:units:${units}:lang:${lang}`;
  const cached = cacheGet(key);
  if (cached) return cached;

  const url = `https://api.openweathermap.org/data/2.5/weather`;
  const params = {
    q: city,
    appid: OPENWEATHER_KEY,
    units,
    lang
  };

  const resp = await axios.get(url, { params });
  cacheSet(key, resp.data);
  return resp.data;
}

async function fetchWeatherByCoords(lat, lon, units = 'metric', lang = 'pt_br') {
  const key = `coords:${lat},${lon}:units:${units}:lang:${lang}`;
  const cached = cacheGet(key);
  if (cached) return cached;

  const url = `https://api.openweathermap.org/data/2.5/weather`;
  const params = {
    lat,
    lon,
    appid: OPENWEATHER_KEY,
    units,
    lang
  };

  const resp = await axios.get(url, { params });
  cacheSet(key, resp.data);
  return resp.data;
}

// Basic routes

app.get('/', (req, res) => {
  res.json({
    service: 'weather-api',
    version: '1.0.0',
    endpoints: [
      '/weather?city=<city>&units=metric',
      '/weather/coords?lat=<lat>&lon=<lon>&units=metric'
    ]
  });
});

// GET /weather?city=São Paulo&units=metric
app.get('/weather', async (req, res) => {
  const city = req.query.city;
  const units = req.query.units || 'metric';
  const lang = req.query.lang || 'pt_br';

  if (!city) {
    return res.status(400).json({ error: 'query param "city" é obrigatório' });
  }
  if (!OPENWEATHER_KEY) {
    return res.status(500).json({ error: 'OPENWEATHER_API_KEY não configurada no servidor' });
  }

  try {
    const data = await fetchWeatherByCity(city, units, lang);
    // return a trimmed response (optional)
    const result = {
      location: `${data.name}, ${data.sys?.country}`,
      coords: data.coord,
      weather: data.weather,
      main: data.main,
      wind: data.wind,
      clouds: data.clouds,
      fetchedAt: new Date().toISOString()
    };
    res.json(result);
  } catch (err) {
    const status = err.response?.status || 500;
    const message = err.response?.data || err.message;
    res.status(status).json({ error: 'Falha ao buscar dados de clima', details: message });
  }
});

// GET /weather/coords?lat=-23.55&lon=-46.63
app.get('/weather/coords', async (req, res) => {
  const { lat, lon } = req.query;
  const units = req.query.units || 'metric';
  const lang = req.query.lang || 'pt_br';

  if (!lat || !lon) {
    return res.status(400).json({ error: 'query params "lat" e "lon" são obrigatórios' });
  }
  if (!OPENWEATHER_KEY) {
    return res.status(500).json({ error: 'OPENWEATHER_API_KEY não configurada no servidor' });
  }

  try {
    const data = await fetchWeatherByCoords(lat, lon, units, lang);
    const result = {
      location: `${data.name}, ${data.sys?.country}`,
      coords: data.coord,
      weather: data.weather,
      main: data.main,
      wind: data.wind,
      clouds: data.clouds,
      fetchedAt: new Date().toISOString()
    };
    res.json(result);
  } catch (err) {
    const status = err.response?.status || 500;
    const message = err.response?.data || err.message;
    res.status(status).json({ error: 'Falha ao buscar dados de clima', details: message });
  }
});

// Health
app.get('/health', (req, res) => {
  res.json({ status: 'ok', ts: new Date().toISOString() });
});

// Start
app.listen(PORT, () => {
  console.log(`Weather API rodando na porta ${PORT}`);
});
