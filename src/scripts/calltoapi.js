function channel(name, cb){
  hp(`https://www.googleapis.com/youtube/v3/channels?key=${apikey}&forUsername=${name}&part=id`, cb);
}

function videos(id, cb){
  if(is(id, "Object")) id = id.items[0].id;
  hp(`https://www.googleapis.com/youtube/v3/playlistItems?key=${apikey}&playlistId=UU${id.slice(2)}&part=snippet&maxResults=24`, cb);
}
