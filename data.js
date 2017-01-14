'use stict';

const fs = require('fs');

const choresPath = './chores.txt';

const formatData = (data) => data
  .split('\n')
  .map(row => {
    const [weekNumber, name, completed] = row.split(',').map(col => col.trim());
    return {
      name,
      completed: Boolean(completed),
      weekNumber: Number(weekNumber)
    }
  });


const unformatData = (data) => data
  .map(({ name, weekNumber, completed }) => [name, week, completed].join(','))
  .join('\n');


function getData(cb) {
  fs.readFile(choresPath, 'utf8', (err, data) => {
    if (err) return console.error(err);
    cb(null, formatData(data));
  })
}

function setData(setter, cb) {
  getData((err, chores) => {
    if (err) console.error(err);
    const unformatted = unformatData( setter(chores) );
    fs.writeFile(choresPath, unformatted, cb);
  })
}

module.exports = { getData, setData };
