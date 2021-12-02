const express = require('express')
const axios = require('axios')
const NodeCache = require('node-cache')

const PORT = 80
const STAR_TTL = 10800 // 3 hours

const PROXY_URL = 'https://z9smj03u77.execute-api.us-east-1.amazonaws.com/stars'
const PROXY_TTL = 60 // 1 minute
const PROXY_KEY = 'stars'

const app = express()
app.use(express.json());

const cache = new NodeCache();

app.get('/', (req, res) => {
  res.send('Shooting stars API')
})

app.get('/stars/all', async (req, res) => {
  const cached = cache.get(PROXY_KEY)
  if (cached) {
    res.json(cached)
    return
  }

  const result = await axios.get(PROXY_URL, { headers: { 'Authorization': 'global' }})
  cache.set(PROXY_KEY, result.data, PROXY_TTL)

  res.json(result.data)
})

app.get('/stars', (req, res) => {
  const stars = cache.keys().filter((key => !Number.isNaN(key))).map(x => cache.get(x))
  res.json(stars)
})

app.post('/stars', (req, res) => {
  const bodyArray = [...req.body]

  const newStars = bodyArray.forEach((input) => {
    const star = {
      location: input.loc,
      world: input.world,
      maxTime: input.maxTime,
      minTime: input.minTime,
    }

    cache.set(star.world, star, STAR_TTL)
  })

  const stars = cache.keys().map(x => cache.get(x))
  res.json(stars)
})

app.listen(PORT, () => {
  console.log(`Shooting stars API listening on port: ${PORT}`)
})
