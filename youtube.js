module.exports = () => {
  var hp = require("request");

  function channel(name, cb){
    hp(`https://www.googleapis.com/youtube/v3/channels?key=${apikey}&forUsername=${name}&part=id`, (err, res, body) => {cb(body)});
  }

  function videos(id, cb){
    if(is(id, "Object")) id = id.items[0].id;
    hp(`https://www.googleapis.com/youtube/v3/playlistItems?key=${apikey}&playlistId=UU${id.slice(2)}&part=snippet&maxResults=24`, (err, res, body) => {cb(body)});
  }

  return function getChannelVideos(cname, cb){
    channel(cname, cdata => {
      videos(cdata, vdata => {
        if(!channels[cname]) channels[cname] = {banlist: [], videos: []};
        channels[cname].videos = channels[cname].videos
          .concat(formatVideos(cname, vdata))
          .sort(sorter(e => e.date));
        channels[cname].nextUpdate = Date.now() + (1000 * 60 * 5);
        cb();
      });
    });
  }
}
