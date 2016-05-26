var express = require("express"),
  sx = express(),
  bodyParser = require("body-parser"),
  fs = require("fs"),
  crypto = require("crypto"),
  users = JSON.parse(fs.readFileSync("./db/users.json")),
  channels = JSON.parse(fs.readFileSync("./db/channels.json"));

function hsh(text){return crypto.createHash("md5").update(text + Date.now().toString()).digest("hex");}

// Everything is a post with JSON.
sx.use(bodyParser.json());

// Sends a token to use in other posts.
sx.post("/auth", (req, res) => {
  var user = users.find(e => e.uid === e.)
  if(req.body.token){
    var result = {};
    if(req.body.token === user.token)
    return res.send((req.body.token === user.token) ? {success: true}, {success: false});
  }
  if(req.body.hash === users[req.body.uid].hash) res.send({token: })
});

// Adding a user.
sx.post("/users/new", (req, res) => {
  if(users[req.body.name]) return res.send({success: false});
  users.push({id: users.length, name: req.body.name, hash: hsh(req.body.password), uid: hsh(req.body.name)});
  res.send({success: true});
});

sx.post("/users", (req, res) => {
  res.send({});
});

sx.get("/channels/:id", (req, res) => {
  if(channels[req.params.id]) return res.send(channels[req.params.id]);
});

sx.listen(4258);
