const app = require('express')()
const tumblr = require('tumblr.js')
const tumbrlClient = tumblr.createClient({
  consumer_key: process.env.TUMBLR_API_KEY,
})

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

app.get('/tumblr', async (req, res) => {
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Cache-Control', 's-max-age=60, stale-while-revalidate')
  const posts = await getTumblrPhotoPosts('rekall')
    .then((posts) => res.json(posts))
    .catch((err) => res.status(500).json({ error: err }))
})

app.get('*', function (req, res) {
  res.status(400).send('🚫')
})

module.exports = app
