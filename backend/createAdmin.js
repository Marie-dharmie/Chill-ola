// createAdmin.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./bookings.db');
const bcrypt = require('bcrypt');

const adminUsername = "chillola"; // Set your admin username
const adminPassword = "chillola2024"; // Set your admin password

bcrypt.hash(adminPassword, 10, (err, hash) => {
    if (err) throw err;
    db.run(
        'INSERT INTO admin_users (username, password_hash) VALUES (?, ?)',
        [adminUsername, hash],
        function(err) {
            if (err) return console.error("Admin already exists or error:", err.message);
            console.log("Admin created!");
            db.close(); // Close DB connection when done
        }
    );
});

