var express = require("express"),
  sx = express(),
  pg = require('pg'),
  dbinfo = require("./dbinfo.js"),
  pg_users = new pg.Client(dbinfo.users),
  pg_channels = new pg.Client(dbinfo.users),
  users = {};

users.connect();

// Everything is a post with JSON.
sx.use(bodyParser.json());

// Sends a token to use in other posts.
// var data = "do shash'owania";
// var crypto = require('crypto');
// crypto.createHash('md5').update(data).digest("hex");
sx.post("/auth", (req, res) => {

});

// Adding a user.
sx.post("/users/new", (req, res) => {
  if(users[req.body.username]) return res.send({text: "Username Exists"});
  pg_users.connect(err => {
    pg_users.query("insert into users (name, hash)")
  });
});

sx.post("/users/:id/groups", (req, res) => {

});

sx.get("/channels/:id", (req, res) => {

});

sx.listen(4258);
