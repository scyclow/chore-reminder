'use stict';

const fs = require('fs');
const moment = require('moment');
const _ = require('lodash');
const rp = require('request-promise');

const today = moment().subtract(5, 'hours')

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


function getData(cb = _.noop) {
  let resolve, reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });

  fs.readFile(choresPath, 'utf8', (err, data) => {
    if (err) {
      reject(err)
      return console.log(err)
    };

    const formatted = formatData(data);
    resolve(formatted)
    cb(null, formatted);
  });

  return promise;
}

function getCurrentWeek(weeks) {
  const currentWeekNumber = today.day() > 0
    ? today.isoWeek()
    : today.isoWeek() - 1; // if sunday, count towards previous week

  return _.find(weeks, week => week.weekNumber === currentWeekNumber);
}

const ROUTE = process.env.NODE_ENV === 'production'
  ? 'https://fastcashmoneyplus.herokuapp.com/'
  : 'http://localhost:8421/';

function getCurrentWeekStatus() {
  return rp({
    uri: ROUTE + 'api/mrclean/getWeek',
    headers: {
      'User-Agent': 'Request-Promise'
    },
    json: true
  })
}

function getWeek() {

  const currentWeek = getData().then(data => getCurrentWeek(data))
  const currentWeekStatus = getCurrentWeekStatus();

  return Promise
    .all([currentWeek, currentWeekStatus])
    .then(([current, status]) => {
      console.log(Object.keys(current))
      current.confirmations = status.week.confirmations;
      return current;
    })
}

function setData(setter, cb) {
  getData((err, chores) => {
    if (err) console.log(err);
    const unformatted = unformatData( setter(chores) );
    fs.writeFile(choresPath, unformatted, cb);
  })
}

function markWeekComplete(name) {
  const uri = `${ROUTE}api/mrclean/markWeekComplete/${name}`;

  return rp({
    uri,
    method: 'POST',
    json: true
  })
}

module.exports = { getData, setData, markWeekComplete, getWeek };

