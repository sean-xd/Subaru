var express = require("express"),
  sx = express(),
  bodyParser = require("body-parser"),
  fs = require("fs"),
  crypto = require("crypto"),
  users = JSON.parse(fs.readFileSync("./db/users.json")),
  channels = JSON.parse(fs.readFileSync("./db/channels.json")),
  oneWeek = 1000 * 60 * 60 * 24 * 7,

sx.use(bodyParser.json());

sx.post("/users/new", (req, res) => {
  res.send(users.find(e => e.name === req.body.name) ? publicData(createUser(req.body)) : {text: "user exists"});
});

sx.post("/users", (req, res) => {
  var b = req.body, user = users.find(e => e.uid === b.uid),
    checkPass = (b.pass && hsh(b.pass) === user.hash),
    checkToken = (b.token === user.token && b.ttl === user.ttl && b.ttl > Date.now());
  if(!user) res.send({text: "no user"});
  if(checkPass){
    user.token = hsh(b.uid);
    user.ttl = Date.now() + oneWeek;
    fs.writeFile("./db/users.json", JSON.stringify(users));
  }
  if(checkPass || checkToken) res.send(publicData(user));
  res.send({text: "auth failed"});
});

sx.get("/channel/:id", (req, res) => {
  if(channels[req.params.id] && channels[req.params.id].ttl > Date.now()) res.send(channels[req.params.id]);
});

function createUser(b){
  var uid = hsh(b.name), user = {
    id: users.length, name: b.name, hash: hsh(b.pass), uid: uid, token: hsh(uid), ttl: Date.now() + oneWeek
  };
  users.push(user);
  fs.writeFile("./db/users.json", JSON.stringify(users));
  res.send(publicData(user));
}
function getUser(type, info){return users.filter(e => e[type] === info)[0];}
function hsh(text){return crypto.createHash("md5").update(text + Date.now().toString()).digest("hex");}
function publicData(user){return {uid: user.uid, groups: user.groups || [], token: user.token, ttl: user.ttl};}

sx.listen(4258);
