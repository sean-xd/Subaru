var icons = {settings: settingsIcon, video: videoIcon},
  panels = {settings: settingsPanel, video: videoPanel, active: false};

["settings", "video"].forEach(name => {
  icons[name].addEventListener("click", function(e){
    toggleDrawer(name);
  });
});

function toggleDrawer(name){
  if(panels.active !== name){
    if(!panels.active) openDrawer();
    else clr(panels[panels.active], "show");
    cla(panels[name], "show");
    panels.active = name;
  }
  else {
    closeDrawer();
    clr(panels[name], "show");
    panels.active = false;
  }
}

function openDrawer(){
  cla(header, "open");
  cla(bg, "short");
  cla(spacer, "space");
}

function closeDrawer(){
  clr(header, "open");
  clr(bg, "short");
  clr(spacer, "space");
}

main.addEventListener("click", function(e){
  if(clc(e.target, "group")) clt(pa(e.target), "expand");
  if(clc(e.target, "video-img") || clc(e.target, "video-title")){
    var id = pa(e.target).id,
      name = el("h3", pa(pa(e.target)))[0].textContent;
    activate(pa(e.target), "active");
    if(panels.active !== "video") toggleDrawer("video");
    if(playing !== id){
      playing = id;
      return player.loadPlaylist(list[name], list[name].indexOf(id));
    }
    player.stopVideo();
    playing = false;
    toggleDrawer("video");
  }
});

function activate(e, cn){
  var active = el("." + cn)[0];
  if(e !== active) e.classList.add(cn);
  if(active) active.classList.remove(cn);
}

function onYouTubeIframeAPIReady(){
  var config = {
    playerVars: {controls: 0, showinfo: 0, iv_load_policy: 3},
    events: {
      onStateChange: onPlayerStateChange,
      onReady: onPlayerReady
    },
    videoId: el(".video")[0] ? el(".video")[0].id : "MhYqKg3oSQ8"
  };
  player = new YT.Player("player", config);
}

function onPlayerReady(){
  player.cuePlaylist(list["Music"]);
}

function onPlayerStateChange(e){
  if(e.data === 0) player.nextVideo();
}

el(".top")[0].addEventListener("click", function(){
  main.scrollTop = 0;
});

spacer.addEventListener("click", function(){
  var state = player.getPlayerState();
  if(state === 0 || state === 2) player.playVideo();
  if(state === 1) player.pauseVideo();
})
