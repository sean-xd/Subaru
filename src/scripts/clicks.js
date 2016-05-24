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
