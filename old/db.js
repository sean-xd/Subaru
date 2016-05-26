module.exports = () => {
  var fs = require("fs"),
    crypto = require("crypto"),
    users = JSON.parse(fs.readFileSync("./db/users.json")),
    channels = JSON.parse(fs.readFileSync("./db/channels.json")),
    oneWeek = 1000 * 60 * 60 * 24 * 7,
    store = {};
  return {
    get: (key, dataKey) => dataKey ? store[key][dataKey] : store[key],
    set: (key, data, dataKey) => {
      if(dataKey) store[key][dataKey] = data;
      else store[key] = data;
      fs.writeFile(`./db/${key}.json`, store[key]);
    }
  };
};
