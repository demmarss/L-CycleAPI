const cors = require('cors');
const winston = require('winston');
const express = require('express');
const app = express();

app.use(cors())

require('./startup/logging');
require('./startup/routes')(app);
require('./startup/db')();
require('./startup/config')();
require('./startup/validation')();

const port = process.env.PORT || 3001;
app.listen(port, () => winston.info(`Listening on port ${port}...`));