// Globals
var ls = localStorage,
  player,
  playing = false,
  bg = el(".bg")[0],
  main = el("main")[0],
  spacer = el(".spacer")[0],
  header = el(".drawer")[0],
  settingsIcon = el(".settingsIcon")[0],
  settingsPanel = el(".settingsPanel")[0],
  videoIcon = el(".videoIcon")[0],
  videoPanel = el(".videoPanel")[0],
  footer = el("footer")[0],
  sections = {},
  channels = ls.channels ? JSON.parse(ls.channels) : {},
  groups = ls.groups ? JSON.parse(ls.groups) : {};

var list = {};

// Main
if(!ls.groups) group("Music", ["EpicNetworkMusic", "UDUBSTEPHD"]);
Object.keys(groups).forEach(load);

// Functions
function group(name, channels, check){ // Modifies group.
  if(check) channels = groups[name].concat(channels); // Check for concat instead of replace.
  groups[name] = channels; // Sets the channels in a group.
  ls.groups = JSON.stringify(groups); // Saves the group to localStorage.
}

function load(name){ // Gets and passes group video data to draw.
  var magic = Magic(groups[name].length, () => {
    ls.channels = JSON.stringify(channels);
    draw(name);
  });
  groups[name].forEach(cname => {
    if(channels[cname]) return magic();
    channel(cname, cdata => {
      videos(cdata, vdata => {
        channels[cname] = format(vdata);
        magic();
      });
    });
  });
}

function format(data){
  var result = data.items.map(item => {
    var e = item.snippet;
    return {
      date: dat(new Date(e.publishedAt)).t,
      title: e.title,
      src: e.thumbnails.medium.url,
      id: e.resourceId.videoId,
      cname: e.channelTitle,
      cid: e.channelId
    };
  });
  return result;
}

function draw(name){
  if(!groups[name]) return;
  if(!sections[name]) sections[name] = t("section")(t("h3", {classes: ["group"]})(name));
  list[name] = groups[name]
    .reduce((arr, cn) => arr.concat(channels[cn]), [])
    .sort(sorter(e => Date.now() - e.date));
  list[name].forEach(e => sections[name].appendChild(videoDom(e)));
  list[name] = list[name].map(e => e.id);
  main.insertBefore(sections[name], footer);
}

function videoDom(data){
  return t(".video", {id: data.id})([
    t("img", {classes: ["video-img"], src: data.src})(),
    t(".video-title")(data.title),
    t("a", {classes: ["video-links"], href: "http://www.youtube.com/channel/" + data.cid})(data.cname)
  ]);
}

function channel(name, cb){
  hp(`https://www.googleapis.com/youtube/v3/channels?key=${apikey}&forUsername=${name}&part=id`, cb);
}

function videos(id, cb){
  if(is(id, "Object")) id = id.items[0].id;
  hp(`https://www.googleapis.com/youtube/v3/playlistItems?key=${apikey}&playlistId=UU${id.slice(2)}&part=snippet&maxResults=50`, cb);
}
