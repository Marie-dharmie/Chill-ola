const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./bookings.db');
db.run('DELETE FROM bookings', function(err) {
    if (err) return console.error(err);
    console.log('All bookings deleted!');
    db.close();
});
