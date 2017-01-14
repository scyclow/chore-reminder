'use stict';

const fs = require('fs');

const choresPath = './chores.txt';

const formatData = (data) => data
  .split('\n')
  .map(row => {
    const [weekNumber, name, completed] = row.split(',').map(col => col.trim());

    if (isNaN(Number(weekNumber))) console.log(new Error('somethings fucked'))
    return {
      name,
      completed: Boolean(completed),
      weekNumber: Number(weekNumber)
    }
  });


const unformatData = (data) => data
  .map(({ name, weekNumber, completed }) => [name, weekNumber, completed].join(','))
  .join('\n');


function getData(cb) {
  fs.readFile(choresPath, 'utf8', (err, data) => {
    if (err) return console.log(err);
    const formatted = formatData(data)
    console.log('FORMATTED DATA:', formatted)
    cb(null, formatted);
  })
}

function setData(setter, cb) {
  getData((err, chores) => {
    if (err) console.log(err);
    const unformatted = unformatData( setter(chores) );
    fs.writeFile(choresPath, unformatted, cb);
  })
}

module.exports = { getData, setData };
