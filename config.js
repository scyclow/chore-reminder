const bodyParser = require('body-parser');
const logger = require('morgan');
const cors = require('cors');

module.exports = (app) => {
  app.use(logger('dev'));

  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());

  app.use(cors());
};
