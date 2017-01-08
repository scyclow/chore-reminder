'use stict';

const fs = require('fs');

const choresPath = './chores.txt';

function getData(cb) {
  fs.readFile(choresPath, 'utf8', (err, data) => {
    if (err) console.error(err);
    cb(null, data);
  })
}

function setData(setter, cb) {
  getData((err, chores) => {
    if (err) console.error(err);
    fs.writeFile(choresPath, setter(chores), cb);
  })
}

module.exports = { getData, setData };
