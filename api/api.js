const express = require('express');
const apiRouter = express.Router();
const artistRouter = require('./artist');
const seriesRouter = require('./series');

apiRouter.use('/artists', artistRouter);
apiRouter.use('/series', seriesRouter);


module.exports = apiRouter;