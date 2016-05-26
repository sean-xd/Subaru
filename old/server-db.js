module.exports = () => {
  var pg = require('pg'),
    db = new pg.Client("postgres://0421.io:5432/db");
  return (query, args, cb) => {
    db.connect(() => {
      db.query(query, args, (err, data) => {
        cb(data, () => db.end());
      });
    })
  }
};
