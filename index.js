'use strict';

const express = require('express')
const config = require('./config');
const { getData, setData } = require('./data');

const app = express();
config(app);

const {
  TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN,
  STEVE_NUMBER, MAX_NUMBER, TOM_NUMBER
} = process.env;

const phoneNumbers = {
  steve: STEVE_NUMBER,
  tom: TOM_NUMBER,
  max: MAX_NUMBER
};

// setData(chores => chores + '\nstuff')

app.get('/', (req, res) => {
  getData((err, data) => {
    console.log('Sending data')
    res.send(data);
  });
});

app.post('/', (req, res) => {
  const { chores, password } = req.body;
  // if correct password is not included, don't reset the times.
  if (password !== process.env.PASSWORD) return res.send('Fuck you.');
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

app.post('/markWeekComplete', (req, res) => {
  console.log(`Received a text from: ${req.body}`)

  const { Body, From } = req.body;
  setData(weeks => {
    const currentWeek = getCurrentWeek(weeks);
    const name = currentWeek.name;
    if (phoneNumbers[name] === From && Body.toLowerCase() === 'clean') {
      currentWeek.complete = true
      return weeks;
    }
    else {
      return weeks;
    }
  });
  // req.status(200);
});


const port = process.env.PORT || 3003;
app.listen(port, (err) => {
  if (err) throw new Error(`Something went wrong with express: ${err}`);

  console.log('Server started', new Date());
  console.log(`App listening on port ${port}`);
});




function getCurrentWeek(weeks) {
  const today = moment().subtract(5, 'hours');

  const currentWeekNumber = today.day() > 0
    ? today.isoWeek()
    : today.isoWeek() - 1; // if sunday, count towards previous week

  return _.find(weeks, week => week.weekNumber === currentWeekNumber);
}
