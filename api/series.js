const express = require('express');
const seriesRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const issuesRouter = require('./issues');

seriesRouter.param('seriesId', (req, res, next, seriesId) => {
    const sql = `SELECT * FROM Series WHERE id = $seriesId`;
    const values = { $seriesId: seriesId };

    db.get(sql, values, (err, series) => {
        if (err) {
            next(err);
        } else if (series) {
            req.series = series;
            next();
        } else {
            res.sendStatus(404);
        }
    })
})

seriesRouter.use('/:seriesId/issues', issuesRouter);

const validateSeries = (req, res, next) => {
    const seriesItem = req.body.series;
    if (!seriesItem.name || !seriesItem.description) {
        return res.sendStatus(400);
    }
    next();
}
seriesRouter.get('/', (req, res, next) => {
    db.all('SELECT * FROM Series', (err, series) => {
        if (err) {
            next(err);
        } else {
            res.status(200).send({ series: series });
        }
    })
})

seriesRouter.get('/:seriesId', (req, res, next) => {
    res.status(200).json({ series: req.series });
})


seriesRouter.post('/', validateSeries, (req, res, next) => {
    const seriesItem = req.body.series;
    const sql = `INSERT INTO Series (name, description) VALUES ($name, $description)`;
    const values = {
        $name: seriesItem.name,
        $description: seriesItem.description
    };

    db.run(sql, values, function (err) {
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Series WHERE id = ${this.lastID}`, (err, series) => {
                res.status(201).json({ series: series })
            })
        }
    })
})

seriesRouter.put('/:seriesId', validateSeries, (req, res, next) => {
    const seriesItem = req.body.series;
    const sql = `UPDATE Series SET name = $name, description = $description WHERE id = $seriesId`;
    const values = {
        $name: seriesItem.name,
        $description: seriesItem.description,
        $seriesId: req.params.seriesId
    };

    db.run(sql, values, (err) => {
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Series WHERE id = ${req.params.seriesId}`, (err, updatedSeries) => {
                res.status(200).json({ series: updatedSeries });
            })
        }
    })
})

seriesRouter.delete('/:seriesId', (req, res, next) => {
    const issueSql = 'SELECT * FROM Issue WHERE Issue.series_id = $seriesId';
    const issueValues = { $seriesId: req.params.seriesId };
    db.get(issueSql, issueValues, (err, issue) => {
        if (err) {
            next(err);
        } else if (issue) {
            return res.sendStatus(400);
        } else {
            const deleteSql = 'DELETE FROM Series WHERE Series.id = $seriesId';
            const deleteValues = { $seriesId: req.params.seriesId };

            db.run(deleteSql, deleteValues, (err) => {
                if (err) {
                    next(err);
                } else {
                    res.sendStatus(204)
                }
            })
        }
    })
})


module.exports = seriesRouter;