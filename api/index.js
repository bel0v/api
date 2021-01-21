const app = require('express')()
require('dotenv').config()
const tumblr = require('tumblr.js')
const _sample = require('lodash.sample')
const got = require('got')
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

app.get('/tumblr/random-photo/:blogId', (req, res) => {
  const blogId = req.params.blogId

  res.setHeader('Cache-Control', 's-max-age=60, stale-while-revalidate')
  res.setHeader('Content-Type', 'application/json')

  getTumblrPhotoPosts(blogId)
    .then((posts) => {
      const images = posts.map(getPostImage)
      const randomImage = _sample(images)
      got.stream(randomImage).pipe(res)
    })
    .catch((err) => {
      res.status(500).send('Something went wrong')
    })
})

app.get('*', function (req, res) {
  res.status(400).send('🚫')
})

app.listen(80)

module.exports = app
