const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./family.db", (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log("Connected to SQLite database.");
    }
});

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS locations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            phone TEXT,
            latitude REAL,
            longitude REAL,
            time TEXT
        )
    `);
});

module.exports = db;