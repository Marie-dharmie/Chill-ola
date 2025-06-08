const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path'); // <-- Make sure this is here!

const app = express();
const PORT = process.env.PORT || 3001; // Use process.env.PORT for Render.com!
const JWT_SECRET = 'VERY_SECRET_KEY_123';

app.use(cors());
app.use(express.json());

// Serve static files from the public directory (one level up)
app.use(express.static(path.join(__dirname, '../public')));

// Optionally, serve index.html for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});



const db = new sqlite3.Database('./bookings.db', (err) => {
    if (err) return console.error('Error opening database:', err.message);
    console.log('Connected to SQLite database.');
});

// Bookings table
db.run(`
  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    checkin_date TEXT NOT NULL,
    checkout_date TEXT NOT NULL,
    room_type TEXT NOT NULL,
    guests INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);
// Admin Users table
db.run(`
  CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
  )
`);


// ------------ BOOKINGS API (anyone can create, only admin can view) ------------

// Create Booking (Public)
app.post('/api/bookings', (req, res) => {
    const { name, phone, email, checkin_date, checkout_date, room_type, guests } = req.body;
    if (!name || !phone || !email || !checkin_date || !checkout_date || !room_type || !guests) {
        return res.status(400).json({ message: 'All fields are required.' });
    }
    const sql = `
    INSERT INTO bookings (name, phone, email, checkin_date, checkout_date, room_type, guests)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
    db.run(
        sql,
        [name, phone, email, checkin_date, checkout_date, room_type, guests],
        function (err) {
            if (err) {
                console.error('Error saving booking:', err.message);
                return res.status(500).json({ message: 'Failed to save booking.' });
            }
            res.status(201).json({ message: 'Booking saved!', bookingId: this.lastID });
        }
    );
});

// ------------ JWT AUTHENTICATION MIDDLEWARE ------------
function authenticateAdmin(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ message: "No token provided" });
    const token = authHeader.split(' ')[1];
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(401).json({ message: "Invalid token" });
        req.user = user;
        next();
    });
}

// ------------ GET ALL BOOKINGS (ADMIN ONLY, PROTECTED) ------------
app.get('/api/bookings', authenticateAdmin, (req, res) => {
    db.all(
        `SELECT * FROM bookings ORDER BY checkin_date DESC`,
        [],
        (err, rows) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Failed to fetch bookings' });
            } else {
                res.json(rows);
            }
        }
    );
});

// ------------ ADMIN USER ROUTES ------------

// Admin Registration (one-time, can remove after first use)
app.post('/api/admin/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password required.' });
    }
    try {
        const saltRounds = 10;
        const password_hash = await bcrypt.hash(password, saltRounds);

        db.run(
            `INSERT INTO admin_users (username, password_hash) VALUES (?, ?)`,
            [username, password_hash],
            function (err) {
                if (err) {
                    if (err.message.includes('UNIQUE')) {
                        return res.status(400).json({ message: 'Username already exists.' });
                    }
                    return res.status(500).json({ message: 'Registration failed.' });
                }
                res.json({ message: 'Admin registered!', adminId: this.lastID });
            }
        );
    } catch (e) {
        res.status(500).json({ message: 'Error hashing password.' });
    }
});

// Admin Login (returns JWT on success)
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password required.' });
    }
    db.get(
        `SELECT * FROM admin_users WHERE username = ?`,
        [username],
        async (err, row) => {
            if (err || !row) {
                return res.status(401).json({ message: 'Invalid credentials.' });
            }
            const valid = await bcrypt.compare(password, row.password_hash);
            if (valid) {
                // Generate JWT token
                const token = jwt.sign({ username: row.username, id: row.id }, JWT_SECRET, { expiresIn: '4h' });
                res.json({ message: 'Login successful!', token, username: row.username });
            } else {
                res.status(401).json({ message: 'Invalid credentials.' });
            }
        }
    );
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
