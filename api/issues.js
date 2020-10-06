const express = require('express');
const issuesRouter = express.Router();
const sqlite3 = require('sqlite3');

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database/sqlite');




module.exports = issuesRouter;