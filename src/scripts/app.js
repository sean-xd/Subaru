var kyp = Kyp();

el("main")[0].addEventListener("click", function(e){
  if(!e.target.classList.contains("group")) return;
  e.target.parentNode.parentNode.classList.toggle("expand");
});

function getChannelId(name, cb){
  hp(`https://www.googleapis.com/youtube/v3/channels?key=${apikey}&forUsername=${name}&part=id`, cb);
}

function getUploads(id, cb){
  hp(`https://www.googleapis.com/youtube/v3/channelSections?key=${apikey}&channelId=${id}&part=snippet`, cb);
}
