// Globals
var ls = localStorage,
  player,
  base = {videoId: "zN4m-KcflGg"},
  dom = {main: el("main")[0]},
  channels = ls.channels ? JSON.parse(ls.channels) : {},
  groups = ls.groups ? JSON.parse(ls.groups) : {},
  active = {
    video: false,
    group: false,
    theatre: false
  },
  sections = {},
  list = {};

// Setup
if(!ls.groups){
  groups["Music"] = ["EpicNetworkMusic", "UDUBSTEPHD"];
  groups["Gaming"] = ["killertoast949", "TSirDiesAlot", "PewDiePie"]
  groups["News"] = ["DNewsChannel", "SourceFed", "vice", "sxephil"];
  groups["Happy"] = ["mikefalzone", "thedefrancofam", "MyHarto"];
  ls.groups = JSON.stringify(groups);
}

Object.keys(groups).forEach(key => load(key));

// Functions
function load(name, update){ // Gets and passes group video data to draw.
  var magic = Magic(groups[name].length, () => {
    ls.channels = JSON.stringify(channels); // Save channel data to localStorage.
    draw(name, update); // Constructs dom.
  });
  groups[name].forEach(cname => { // Loops over each channel.
    if(channels[cname] && !update) return magic(); // If you have the data just return.
    channel(cname, cdata => { // Get channel id from channel name.
      videos(cdata, vdata => { // Get playlist data from channel id.
        channels[cname] = format(vdata); // Store formatted data.
        magic(); // Tells magic when all the data is ready.
      });
    });
  });
}

function format(data){ // Take just the data we need.
  var result = data.items.map(item => {
    var e = item.snippet, d = new Date(e.publishedAt);
    return {
      date: d.getTime(),
      title: e.title,
      src: e.thumbnails.medium.url,
      id: e.resourceId.videoId,
      cname: e.channelTitle,
      cid: e.channelId
    };
  });
  return result;
}

function draw(name, update){
  console.log(update);
  if(!groups[name]) return;
  if(!sections[name]) sections[name] = t("section", {id: name})([
    t("h3", {classes: ["group"]})(name),
    t("i", {classes: ["settings", "material-icons"]})("settings"),
    t(".panel")([
      t(".left")([
        t("h2")("Group Editor"),
        t("input", {placeholder: "Enter Channel Name"})(),
        t(".add")("Add Channel")
      ]),
      t(".right")(groups[name].map(cname => t(".channel")([
        t(".cname")(cname),
        t("i", {classes: ["delete", "material-icons"]})("delete_forever")
      ])))
    ])
  ]);

  if(update){
    while(sections[name].children.length > 3){
      sections[name].removeChild(sections[name].children[sections[name].children.length - 1]);
    }
  }

  list[name] = groups[name]
    .reduce((arr, cn) => arr.concat(channels[cn]), [])
    .sort(sorter(e => Date.now() - e.date));

  list[name].forEach(e => sections[name].appendChild(videoDom(e)));
  list[name] = list[name].map(e => e.id);
  if(!update) dom.main.appendChild(sections[name]);
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
  hp(`https://www.googleapis.com/youtube/v3/playlistItems?key=${apikey}&playlistId=UU${id.slice(2)}&part=snippet&maxResults=24`, cb);
}

function toggleDrawer(name){
  if(is(name, "String")) active.group = name;
  active.theatre = !active.theatre;
  clt(el(".drawer")[0], "open");
  clt(el(".bg")[0], "short");
  clt(dom.main, "space");
  clt(el("#" + active.group), "expand");
  if(!active.theatre){
    active.group = false;
    active.video = false;
  }
  active.group ? player.cuePlaylist(list[active.group]) : player.cueVideoById(base.videoId);
  Object.keys(groups).forEach(key => {
    if(!active.group) return clr(el("#" + key), "hide");
    if(key !== active.group) cla(el("#" + key), "hide");
  });
}

dom.main.addEventListener("click", e => {
  if(clc(e.target, "add")){
    var channelName = el("input", pa(e.target))[0].value,
      groupName = pa(pa(pa(e.target))).id;
    el("input", pa(e.target))[0].value = "";
    groups[groupName].push(channelName);
    ls.groups = JSON.stringify(groups);
    el(".right", pa(pa(e.target)))[0].appendChild(t(".channel")([
      t(".cname")(channelName),
      t("i", {classes: ["delete", "material-icons"]})("delete_forever")
    ]));
    load(groupName, 1);
  }
  if(clc(e.target, "delete")){
    var channelName = el(".cname", pa(e.target))[0].textContent,
      groupName = pa(pa(pa(pa(e.target)))).id;
    groups[groupName] = groups[groupName].filter(chan => chan !== channelName);
    ls.groups = JSON.stringify(groups);
    pa(pa(e.target)).removeChild(pa(e.target));
    load(groupName, 1);
  }

  if(clc(e.target, "settings")){
    if(active.theatre) toggleDrawer();
    clt(el(".panel", pa(e.target))[0], "show");
  }
  if(clc(e.target, "group")){
    toggleDrawer(e.target.textContent);
  }
  if(clc(e.target, "video-img") || clc(e.target, "video-title")){
    var id = pa(e.target).id;
    if(!active.theatre) toggleDrawer(el("h3", pa(pa(e.target)))[0].textContent);
    if(active.video !== id){
      active.video = id;
      return player.loadPlaylist(list[active.group], list[active.group].indexOf(id));
    }
    (player.getPlayerState() === 5) ? player.playVideo() : player.stopVideo();
  }
});

el(".next")[0].addEventListener("click", () => {
  active.video = list[active.group][list[active.group].indexOf(active.video) + 1];
  player.nextVideo();
});
el(".prev")[0].addEventListener("click", () => {
  if(list[active.group].indexOf(active.video) < 1) return;
  active.video = list[active.group][list[active.group].indexOf(active.video) - 1];
  player.previousVideo();
});
el(".top")[0].addEventListener("click", () => {el(".content")[0].scrollTop = 0;});

function onYouTubeIframeAPIReady(){
  player = new YT.Player("player", {
    playerVars: {controls: 1, showinfo: 0, iv_load_policy: 3},
    events: {
      onStateChange: onPlayerStateChange,
      onReady: () => {
        player.cuePlaylist(list[active.group]);
      }
    },
    videoId: el(".video")[0] ? el(".video")[0].id : list[active.group] ? list[active.group][0] : "MhYqKg3oSQ8"
  });
}

function onPlayerStateChange(e){
  if(e.data === 0){
    active.video = list[active.group][list[active.group].indexOf(active.video) + 1];
  }
  if(el(".active")[0] && (e.data === -1 || e.data === 1)){
    clr(el(".active")[0], "active");
  }
  if(el("#" + active.video) && e.data === 1){ // If playing activate video dom.
    cla(el("#" + active.video), "active");
  }
}
