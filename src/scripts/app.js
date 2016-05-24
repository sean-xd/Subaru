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
    if(channels[cname] && !update && time < nextUpdate[name]) return magic(); // If you have the data return.
    channel(cname, cdata => { // Get channel id from channel name.
      videos(cdata, vdata => { // Get playlist data from channel id.
        channels[cname] = format(vdata); // Store formatted data.
        magic(); // Tells magic when all the data is ready.
      });
    });
  });
  if(nextUpdate[name] < time || update) nextUpdate[name] = time + (1000 * 60 * 5);
  ls.nextUpdate = JSON.stringify(nextUpdate);
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
