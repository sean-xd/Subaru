function getChannelId(name, cb){
  hp(`https://www.googleapis.com/youtube/v3/channels?key=${apikey}&forUsername=${name}&part=id`, cb);
}

function getUploads(id, cb){
  hp(`https://www.googleapis.com/youtube/v3/channelSections?key=${apikey}&channelId=${id}&part=snippet`, cb);
}

function test(name, cb){
  getChannelId(name, function(data){
    getUploads(data.items[0].id, cb);
  });
}

test("EpicNetworkMusic", function(data){
  console.log(data);
});
