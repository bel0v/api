require('dotenv').config()
const NodeCache = require('node-cache')
const tumblr = require('tumblr.js')
const _sample = require('lodash.sample')
const got = require('got')
const router = require('express').Router()

const tumbrlClient = tumblr.createClient({
  consumer_key: process.env.TUMBLR_API_KEY,
})

const tumblrCache = new NodeCache()

const ONE_MINUTE = 60
const ONE_HOUR = ONE_MINUTE * 60

function getRandomInt(min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function getTumblrPhotos(blogName) {
  return new Promise((resolve, reject) => {
    const cached = tumblrCache.get(blogName)
    if (cached) {
      resolve(cached)
      return
    }
    const total = tumblrCache.get(`${blogName}-total`) || 0
    const totalPages = Math.floor(total / 20)

    // if no cache, the offset is 0; after the 1st request we know the total amount of posts,
    // so next requests (after posts cache expires), have a random offset
    const postsFetchOffset = getRandomInt(0, totalPages)
    tumbrlClient.blogPosts(
      blogName,
      { type: 'photo', offset: postsFetchOffset },
      function (err, { posts, total_posts }) {
        if (err) {
          reject(err)
        } else {
          const photos = posts.map(getPostImage)

          tumblrCache.set(blogName, photos, ONE_HOUR)
          tumblrCache.set(`${blogName}-total`, total_posts)

          resolve(photos)
        }
      },
    )
  })
}

function getPostImage(post) {
  return post.photos ? post.photos[0].original_size.url : undefined
}

router.get('/random-photo/:blogId', (req, res) => {
  const blogId = req.params.blogId

  res.setHeader('Cache-Control', 's-max-age=60, stale-while-revalidate')
  res.setHeader('Content-Type', 'application/json')

  getTumblrPhotos(blogId)
    .then((photos) => {
      const randomImage = _sample(photos)
      got.stream(randomImage).pipe(res)
    })
    .catch((err) => {
      res.status(500).send('Something went wrong')
    })
})

router.get('*', function (req, res) {
  res.status(400).send('🚫')
})

module.exports = router
