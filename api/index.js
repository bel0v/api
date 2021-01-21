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

app.get('/tumblr', (req, res) => {
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Cache-Control', 's-max-age=60, stale-while-revalidate')
  getTumblrPhotoPosts('rekall')
    .then((posts) => res.end(posts))
    .catch((err) => res.err(err))
})

app.get('*', function (req, res) {
  res.send('🚫', 404)
})

module.exports = app
