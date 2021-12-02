const express = require('express')
const NodeCache = require('node-cache')

const PORT = 80
const TTL = 10800 // 3 hours

const app = express()
app.use(express.json());

const cache = new NodeCache();

app.get('/', (req, res) => {
  res.send('Shooting stars API')
})

app.get('/stars', (req, res) => {
  const stars = cache.keys().map(x => cache.get(x))
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

    cache.set(star.world, star, TTL)
  })

  const stars = cache.keys().map(x => cache.get(x))
  res.json(stars)
})

app.listen(PORT, () => {
  console.log(`Shooting stars API listening on port: ${PORT}`)
})
