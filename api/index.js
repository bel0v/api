const app = require('express')()
const tumblr = require('./tumblr')

app.use('/tumblr', tumblr)

app.get('*', function (req, res) {
  res.status(400).send('🚫')
})

app.listen(80)

module.exports = app
