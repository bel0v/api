const app = require("express")();

app.get("/tumblr", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "s-max-age=60, stale-while-revalidate");
  res.end(`sending tumbr info`);
});

module.exports = app;
