// Globals
var ls = localStorage,
  kyp = Kyp(),
  player,
  base = {videoId: "zN4m-KcflGg"},
  dom = {
    main: el("main")[0],
    sections: {},
    create: el(".create")[0],
    content: el(".content")[0],
    aside: el("aside")[0],
    drawer: el(".drawer")[0],
    bg: el(".bg")[0]
  },
  channels = ls.channels ? JSON.parse(ls.channels) : {},
  groups = ls.groups ? JSON.parse(ls.groups) : {},
  active = {video: false, group: false, theatre: false},
  list = [],
  nextUpdate = ls.nextUpdate ? JSON.parse(ls.nextUpdate) : {},
  banlist = ls.banlist ? JSON.parse(ls.banlist) : [];

if(Object.keys(groups).length){
  Object.keys(groups).sort().forEach(key => load(key));
}

// Functions
function load(name, update){ // Gets and passes group video data to draw.
  var time = Date.now(),
    magic = Magic(groups[name].length, () => {
      ls.channels = JSON.stringify(channels); // Save channel data to localStorage.
      draw(name, update); // Constructs dom.
    });
  if(!nextUpdate[name]) nextUpdate[name] = time - 1;
  groups[name].forEach(cname => { // Loops over each channel.
    if(channels[cname] && !update && time < nextUpdate[name]) return magic(); // If you have the data just return.
    channel(cname, cdata => { // Get channel id from channel name.
      videos(cdata, vdata => { // Get playlist data from channel id.
        channels[cname] = format(vdata); // Store formatted data.
        magic(); // Tells magic when all the data is ready.
      });
    });
  });
  if(nextUpdate[name] < time || update) ls.nextUpdate = time + (1000 * 60 * 5);
}

function format(data){ // Take just the data we need.
  return data.items.map(item => {
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
}

function draw(name, update){
  if(!groups[name]) return;
  if(!dom.sections[name]) dom.sections[name] = sectionDom(name);
  if(update){
    while(dom.sections[name].children.length > 3){
      dom.sections[name].removeChild(dom.sections[name].children[dom.sections[name].children.length - 1]);
    }
  }
  var playlist = groups[name].reduce((arr, cn) => {
    return arr.concat(channels[cn]).filter(video => banlist.indexOf(video.id) === -1);
  }, []);
  playlist.sort(sorter(e => Date.now() - e.date));
  playlist.forEach(e => dom.sections[name].appendChild(videoDom(e)))
  list[name] = playlist.map(e => e.id);
  if(list[name].length > 100) list[name] = list[name].slice(0,99);
  if(!update){
    dom.main.appendChild(dom.sections[name]);
    dom.aside.appendChild(groupSideDom(name));
  }
  else if(active.video) cla(el("#" + active.video), "active");
}

function channel(name, cb){
  hp(`https://www.googleapis.com/youtube/v3/channels?key=${apikey}&forUsername=${name}&part=id`, cb);
}

function videos(id, cb){
  if(is(id, "Object")) id = id.items[0].id;
  hp(`https://www.googleapis.com/youtube/v3/playlistItems?key=${apikey}&playlistId=UU${id.slice(2)}&part=snippet&maxResults=24`, cb);
}

function toggleDrawer(name){
  var close = false;
  if(!player) activatePlayer();
  if(is(name, "String")){
    if(active.group === name) close = true;
    else {
      if(active.group) clr(el("#" + active.group), "expand");
      active.group = name;
    }
  }
  if(close || !active.theatre){
    active.theatre = !active.theatre;
    clt(dom.drawer, "open");
    clt(dom.bg, "short");
    clt(dom.main, "space");
  }
  clt(el("#" + active.group), "expand");
  if(!active.theatre){
    active.group = false;
    active.video = false;
  }
  else el(".content")[0].scrollTop = 0;
  active.group ? player.cuePlaylist(list[active.group]) : player.cueVideoById(base.videoId);
  Object.keys(groups).forEach(key => {
    if(!active.group) return clr(el("#" + key), "hide");
    if(key !== active.group) cla(el("#" + key), "hide");
    if(key === active.group) clr(el("#" + key), "hide");
  });
}

function ban(groupName, id){
  if(id === active.video) nextVideo();
  banlist.push(id);
  ls.banlist = JSON.stringify(banlist);
  load(groupName, 1);
}

function nextVideo(){
  active.video = list[active.group][list[active.group].indexOf(active.video) + 1];
  player.nextVideo();
}

function openSidebar(){
  clt(dom.content, "small");
  clt(dom.aside, "big");
  clt(dom.drawer, "small");
}

// Click Events
kyp("tab", e => {e.preventDefault(); openSidebar();});
el(".hamburger")[0].addEventListener("click", openSidebar);

dom.aside.addEventListener("click", e => {
  if(clc(e.target, "gs-title")) toggleDrawer(e.target.textContent);
});

var isCreateOpen = false;
dom.create.addEventListener("click", e => {
  clt(el(".createInput")[0], "long");
  if(isCreateOpen){
    var val = el(".createInput")[0].value;
    groups[val] = [];
    dom.sections[val] = sectionDom(val);
    var order = Object.keys(groups).sort(),
      index = order.indexOf(val) + 1;
    if(index === order.length) dom.main.appendChild(dom.sections[val]);
    else dom.main.insertBefore(dom.sections[val], el("#" + order[index]));
  }
  dom.create.textContent = isCreateOpen ? "playlist_add" : "playlist_add_check";
  isCreateOpen = !isCreateOpen;
});

dom.main.addEventListener("click", e => {
  if(clc(e.target, "remove")){
    var id = pa(pa(e.target)).id;
    dom.main.removeChild(dom.sections[id]);
    groups = Object.keys(groups).reduce((obj, key) => {
      if(key !== id) obj[key] = groups[key];
      return obj;
    }, {});
    ls.groups = JSON.stringify(groups);
  }
  if(clc(e.target, "refresh")){
    load(pa(pa(e.target)).id, 1);
  }
  if(clc(e.target, "add")){
    var channelName = el("input", pa(e.target))[0].value,
      groupName = pa(pa(pa(e.target))).id;
    el("input", pa(e.target))[0].value = "";
    groups[groupName].push(channelName);
    ls.groups = JSON.stringify(groups);
    el(".right", pa(pa(e.target)))[0].appendChild(channelDom(channelName));
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

el(".next")[0].addEventListener("click", nextVideo);
el(".prev")[0].addEventListener("click", () => {
  if(list[active.group].indexOf(active.video) < 1) return;
  active.video = list[active.group][list[active.group].indexOf(active.video) - 1];
  player.previousVideo();
});
el(".top")[0].addEventListener("click", () => {el(".content")[0].scrollTop = 0;});

// Youtube Player Stuff
function activatePlayer(){
  player = new YT.Player("player", {
    playerVars: {controls: 1, showinfo: 0, iv_load_policy: 3},
    events: {
      onStateChange: onPlayerStateChange,
      onReady: () => {player.cuePlaylist(list[active.group]);}
    },
    videoId: el(".video")[0] ? el(".video")[0].id : list[active.group] ? list[active.group][0] : "MhYqKg3oSQ8"
  });
}

function onYouTubeIframeAPIReady(){
  activatePlayer();
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
