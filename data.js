'use stict';

const fs = require('fs');

const choresPath = './chores.txt';

const formatData = (data) => data
  .split('\n')
  .map(row => {
    const [weekNumber, name] = row.split(',').map(col => col.trim());

    if (isNaN(Number(weekNumber))) console.log(new Error('somethings fucked'))
    return {
      name,
      weekNumber: Number(weekNumber)
    }
  });


const unformatData = (data) => data
  .map(({ name, weekNumber }) => [name, weekNumber].join(','))
  .join('\n');


function getData(cb) {
  fs.readFile(choresPath, 'utf8', (err, data) => {
    if (err) return console.log(err);
    cb(null, formatData(data));
  })
}

function setData(setter, cb) {
  getData((err, chores) => {
    if (err) console.log(err);
    const unformatted = unformatData( setter(chores) );
    fs.writeFile(choresPath, unformatted, cb);
  })
}

const DB_PATH = './db.json';

function confirmWeek(weekNumber, name, cb = _.noop) {
  const db = require(DB_PATH)
  if (!_.includes(db[weekNumber].confirmations, name)) {
    db[weekNumber].confirmations.push(name);
    fs.writeFile(DB_PATH, JSON.stringify(db), (err) => {
      cb(err, db[weekNumber].confirmations)
    });
  }
}

function isWeekComplete(weekNumber) {
  const db = require(DB_PATH)
  return db[weekNumber] && db[weekNumber].confirmations.length >= 2;
}

module.exports = { getData, setData, isWeekComplete, confirmWeek };

