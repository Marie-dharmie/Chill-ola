// view-bookings.js
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('bookings.db');

db.all("SELECT * FROM bookings", [], (err, rows) => {
    if (err) {
        throw err;
    }
    console.table(rows);
    db.close();
});
