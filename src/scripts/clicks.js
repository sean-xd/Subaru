kyp("tab", e => {e.preventDefault(); openSidebar();});
el(".hamburger")[0].addEventListener("click", openSidebar);

dom.aside.addEventListener("click", e => {
  if(clc(e.target, "gs-title")) toggleDrawer(e.target.textContent);
});

dom.create.addEventListener("click", e => {
  clt(dom.createInput, "long");
  if(active.create && dom.createInput.value) addGroup(dom.createInput.value);
  dom.create.textContent = active.create ? "playlist_add" : "playlist_add_check";
  active.create = !active.create;
});

function addGroup(val){
  groups[val] = {channels: [], playback: 1};
  dom.sections[val] = sectionDom(val);
  var order = Object.keys(groups).sort(sorter(e => e)),
    index = order.indexOf(val) + 1;
  if(index === order.length) dom.main.appendChild(dom.sections[val]);
  else dom.main.insertBefore(dom.sections[val], el("#" + order[index]));
}

function removeGroup(e){
  var id = pa(pa(e)).id;
  dom.main.removeChild(dom.sections[id]);
  groups = Object.keys(groups).reduce((obj, key) => {
    if(key !== id) obj[key] = groups[key];
    return obj;
  }, {});
  lss("groups", groups);
}

function addChannel(e){
  var channelName = el("input", pa(e))[0].value,
    groupName = pa(pa(pa(e))).id;
  el("input", pa(e))[0].value = "";
  groups[groupName].channels.push(channelName);
  lss("groups", groups);
  el(".right", pa(pa(e)))[0].appendChild(channelDom(channelName));
  load(groupName, 1);
}

function removeChannel(e){
  var channelName = el(".cname", pa(e))[0].textContent,
    groupName = pa(pa(pa(pa(e)))).id;
  groups[groupName].videos = groups[groupName].videos.filter(chan => chan !== channelName);
  lss("groups", groups);
  pa(pa(e)).removeChild(pa(e));
  load(groupName, 1);
}

function toggleVideo(e){
  var id = pa(e).id;
  if(!active.theatre) toggleDrawer(el("h3", pa(pa(e)))[0].textContent);
  if(active.video !== id){
    active.video = id;
    return player.loadPlaylist(list[active.group], list[active.group].indexOf(id));
  }
  (player.getPlayerState() === 5) ? player.playVideo() : player.stopVideo();
}

function nextVideo(){
  active.video = list[active.group][list[active.group].indexOf(active.video) + 1];
  player.nextVideo();
}

function previousVideo(){
  if(list[active.group].indexOf(active.video) < 1) return;
  active.video = list[active.group][list[active.group].indexOf(active.video) - 1];
  player.previousVideo();
}

dom.main.addEventListener("click", e => {
  if(clc(e.target, "group")) toggleDrawer(e.target.textContent);
  if(clc(e.target, "remove")) removeGroup(e.target);
  if(clc(e.target, "refresh")) load(pa(pa(e.target)).id, 1);
  if(clc(e.target, "add")) addChannel(e.target);
  if(clc(e.target, "delete")) removeChannel(e.target);
  if(clc(e.target, "video-img") || clc(e.target, "video-title")) toggleVideo(e.target);

  // CHANGE THIS SHIT
  if(clc(e.target, "settings")){
    if(active.theatre) toggleDrawer();
    clt(el(".panel", pa(e.target))[0], "show");
  }
});

el(".next")[0].addEventListener("click", nextVideo);
el(".prev")[0].addEventListener("click", previousVideo);
el(".top")[0].addEventListener("click", () => {el(".content")[0].scrollTop = 0;});
