'use strict';

const express = require('express')
const twilio = require('twilio')
const moment = require('moment')
const _ = require('lodash')
const config = require('./config');
const childProcess = require('child_process')

const { getData, setData, markWeekComplete } = require('./data');

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

function sendConfirmationText(confirmations) {
  if (confirmations.length > 1) {
    _.forEach(phoneNumbers, number => {
      sendTextMessage(number, 'The apartment is now clean, according to: ' + confirmations.join(', '))
    });
    return console.log('CONFIRMATIONS:', confirmations);
  }

  const name = confirmations[0];
  const namesToText = Object.keys(phoneNumbers).filter(key => key !== name)

  console.log('TEXTING:', namesToText)
  namesToText.forEach(nameToText => {
    sendTextMessage(phoneNumbers[nameToText], `${name} claims that the apartment is clean. Can you confirm?`)
  });
}

app.post('/markWeekComplete', (req, res) => {
  console.log(`Received a text from: ${JSON.stringify(req.body, null, 3)}`)

  const { Body, From } = req.body;

  const isReminder = Body.toLowerCase().match(/^remind/)
  const isCompletion = Body.toLowerCase().match(/(clean)|(confirm)|(yes)/);

  if (isReminder) {
    // TODO pull out actual texting logic -- have scheduler and this code call the texting logic
    // scheduler should only handle the time logic
    childProcess.fork('./bin/scheduler')
  }

  else if (isCompletion) {
    const name = _.findKey(phoneNumbers, (value) => value === From)
    if (!name) {
      console.log('NAME NOT FOUND')
      console.log('TEXT FROM NUMBER:', From)
      console.log('ALL NUMBERS:', JSON.stringify(phoneNumbers, null, 3))
      return;
    }

    console.log('RECEIVED TEXT FROM:', name)
    markWeekComplete(name)
      .then(data => data.week.confirmations)
      .then(sendConfirmationText)
      .catch(err => console.log(err))

  }

  res.status(200).send('OK');
});


const port = process.env.PORT || 3003;
app.listen(port, (err) => {
  if (err) throw new Error(`Something went wrong with express: ${err}`);

  console.log('Server started', new Date());
  console.log(`App listening on port ${port}`);
});



// TODO pull shit stuff out into a file, and stop duplicating with scheduler
function getCurrentWeek(weeks) {
  const today = moment().subtract(5, 'hours');

  const currentWeekNumber = today.day() > 0
    ? today.isoWeek()
    : today.isoWeek() - 1; // if sunday, count towards previous week

  return _.find(weeks, week => week.weekNumber === currentWeekNumber);
}

function sendTextMessage (phoneNumber, msg) {
  if (process.env.NODE_ENV !== 'production') return;

  const client = new twilio.RestClient(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

  client.messages.create({
    body: msg,
    to: phoneNumber,
    from: '+19179245379'
  }, (err, message) => {
    if (err) return console.log(err);
    console.log(`Text sent to [${phoneNumber}] with message sid: ${message.sid}`);
  });
}
