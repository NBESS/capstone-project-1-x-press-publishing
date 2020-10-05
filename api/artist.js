const express = require('express');
const artistRouter = express.Router();
const sqlite3 = require('sqlite3');

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database/sqlite');

artistRouter.get('/', (req, res, next) => {
    db.all(`SELECT * FROM Artist WHERE Artist.is_currently_employed = 1`, (err, artists) => {
        if (err) {
            next(err);
        } else {
            res.status(200).send({ artists: artists });
        }
    })
})

module.exports = artistRouter;