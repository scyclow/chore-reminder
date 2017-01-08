'use strict';

const express = require('express')
// const moment = require('moment')
// const twilio = require('twilio')
const fs = require('fs');
const config = require('./config');

const app = express();
config(app);

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


// setData(chores => chores + '\nstuff')

app.get('/', (req, res) => {
  getData((err, data) => {
    console.log('Sending data')
    res.send(data);
  });
});

app.post('/', (req, res) => {
  const { chores, password } = req.body;
  if (password !== 'StompLookAndListen') return res.send('Fuck you.');
  console.log('Setting data')
  setData(
    () => chores, // overwrite chores.txt
    (err) => { // then respond
      console.log('Responding')
      if (err) res.send('Something got fucked up.')
      else res.send('Chores were set.')
    }
  )
});


const port = process.env.port || 3003;
app.listen(port, (err) => {
  if (err) throw new Error(`Something went wrong with express: ${err}`);

  console.log('Server started', new Date());
  console.log(`App listening on port ${port}`);
});

