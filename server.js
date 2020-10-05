const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const errorhandler = require('errorhandler');
const morgan = require('morgan');

const app = express();

const PORT = process.env.PORT || 3000;

const apiRouter = require('./api/api');

app.use(bodyParser.json());
app.use(errorhandler());
app.use(cors());
app.use(morgan('dev'));

app.use('/api', apiRouter);



app.listen(PORT, () => console.log(`Listening: Port ${PORT}`));

module.exports = app;







