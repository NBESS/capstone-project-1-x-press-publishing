const express = require('express');
const artistRouter = express.Router();
const sqlite3 = require('sqlite3');

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

artistRouter.get('/', (req, res, next) => {
    db.all(`SELECT * FROM Artist WHERE is_currently_employed = 1`, (err, artists) => {
        if (err) {
            next(err);
        } else {
            res.status(200).json({ artists: artists });
        }
    })
})

artistRouter.param('artistId', (req, res, next, artistId) => {
    const sql = `SELECT * FROM Artist WHERE id = $artistId`;
    const values = { $artistId: artistId };
    db.get(sql, values, (err, artist) => {
        if (err) {
            next(err);
        } else if (artist) {
            req.artist = artist;
            next();
        } else {
            res.sendStatus(404);
        }
    })
})

artistRouter.get('/:artistId', (req, res, next) => {
    res.status(200).send({ artist: req.artist })
})

const validateArtist = (req, res, next) => {
    const artistItem = req.body.artist;
    if (!artistItem.name || !artistItem.dateOfBirth || !artistItem.biography) {
        return res.sendStatus(400);
    }
    next();
}

artistRouter.post('/', validateArtist, (req, res, next) => {
    const artistItem = req.body.artist;
    db.run(`INSERT INTO Artist (name, date_of_birth, biography, is_currently_employed) 
    VALUES ($name, $dateOfBirth, $biography, $isCurrentlyEmployed)`,
        {
            $name: artistItem.name,
            $dateOfBirth: artistItem.dateOfBirth,
            $biography: artistItem.biography,
            $isCurrentlyEmployed: artistItem.isCurrentlyEmployed === 0 ? 0 : 1
        }, function (err) {
            if (err) {
                next(err);
            } else {
                db.get(`SELECT * FROM Artist WHERE id = ${this.lastID}`, (err, artist) => {
                    res.status(201).send({ artist: artist })
                })
            }

        });
})

artistRouter.put('/:artistId', validateArtist, (req, res, next) => {
    const artistItem = req.body.artist;
    const sql = 'UPDATE Artist SET name = $name, date_of_birth = $dateOfBirth, biography = $biography, is_currently_employed = $isCurrentlyEmployed WHERE Artist.id = $artistId';
    const values = {
        $name: artistItem.name,
        $dateOfBirth: artistItem.dateOfBirth,
        $biography: artistItem.biography,
        $isCurrentlyEmployed: artistItem.isCurrentlyEmployed,
        $artistId: req.params.artistId
    };

    db.run(sql, values, (err) => {
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Artist WHERE id = ${req.params.artistId}`, (err, updatedArtist) => {
                res.status(200).send({ artist: updatedArtist });
            })
        }
    });
})

artistRouter.delete('/:artistId', (req, res, next) => {
    const sql = 'UPDATE Artist SET is_currently_employed = $isCurrentlyEmployed WHERE Artist.id = $artistId';
    const values = {
        $isCurrentlyEmployed: 0,
        $artistId: req.params.artistId
    };

    db.run(sql, values, (err) => {
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Artist WHERE id = ${req.params.artistId}`, (err, deletedArtist) => {
                res.status(200).send({ artist: deletedArtist });
            })
        }
    });
})



module.exports = artistRouter;