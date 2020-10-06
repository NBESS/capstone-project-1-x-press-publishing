const sqlite3 = require('sqlite3');

db = new sqlite3.Database('./database.sqlite');

db.serialize(() => {
    db.run(`DROP TABLE IF EXISTS Artist`);
    db.run(`CREATE TABLE IF NOT EXISTS Artist (
        id INTEGER,
        name TEXT NOT NULL,
        date_of_birth TEXT NOT NULL,
        biography TEXT NOT NULL,
        is_currently_employed INTEGER NOT NULL DEFAULT 1,
        PRIMARY KEY('id')
    )`);
    db.run(`DROP TABLE IF EXISTS Series`);
    db.run(`CREATE TABLE IF NOT EXISTS Series (
        id INTEGER,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        PRIMARY KEY('id')
    )`);
})