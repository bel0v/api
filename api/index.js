const app = require('express')()
const tumblr = require('tumblr.js')
const _sample = require('lodash.sample')
const tumbrlClient = tumblr.createClient({
  consumer_key: process.env.TUMBLR_API_KEY,
})

// TODO implement images cache

function getTumblrPhotoPosts(blogName) {
  return new Promise((resolve, reject) => {
    tumbrlClient.blogPosts(blogName, { type: 'photo' }, function (err, resp) {
      if (err) {
        reject(err)
      } else {
        resolve(resp.posts)
      }
    })
  })
}

function getPostImage(post) {
  return post.photos ? post.photos[0].original_size.url : undefined
}

app.get('/tumblr', (req, res) => {
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Cache-Control', 's-max-age=60, stale-while-revalidate')
  getTumblrPhotoPosts('rekall')
    .then((posts) => {
      const images = posts.map(getPostImage)
      const randomImage = _sample(images)
      res.json(randomImage)
    })
    .catch((err) => res.status(500).json({ error: err }))
})

app.get('*', function (req, res) {
  res.status(400).send('🚫')
})

module.exports = app
