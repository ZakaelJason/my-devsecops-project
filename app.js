const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const config = require('./config'); // Import the config.js file

const app = express();
const port = 3000;

// Middleware to parse JSON requests
app.use(express.urlencoded({extended: true}));
app.use(express.json());

// Initialize SQLite database
const db = new sqlite3.Database(':memory:');

db.serialize(() => {
    // Create table user and insert sample data
    db.run("Create Table users (id INT, Username TEXT, Password TEXT, role TEXT)");
    db.run("INSERT INTO users (id, Username, Password, role) VALUES (1, 'admin', '${config.db_password}', 'administrator')");
    db.run("INSERT INTO users (id, Username, Password, role) VALUES (2, 'guest', 'guest123', 'viewer')");
});

// Login
app.get('/', (req, res) => {
    res.send(`
    <html>
      <body style="font-family: Arial, sans-serif; padding: 50px; background-color: #f4f4f9;">
        <h2>Vulnerable Login Web - DevSecOps Testing</h2>
        <form action="/login" method="POST" style="background: white; padding: 20px; border-radius: 5px; max-width: 300px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
          <div style="margin-bottom: 15px;">
            <label>Username:</label><br>
            <input type="text" name="username" style="width: 100%; padding: 8px;" required>
          </div>
          <div style="margin-bottom: 15px;">
            <label>Password:</label><br>
            <input type="password" name="password" style="width: 100%; padding: 8px;" required>
          </div>
          <button type="submit" style="padding: 10px 15px; background-color: #007bff; color: white; border: none; border-radius: 3px; cursor: pointer;">Login</button>
        </form>
        <p style="margin-top: 20px;"><a href="/search?query=admin">Coba Fitur Cari User (Tanpa Login)</a></p>
      </body>
    </html>
  `);
});

// SQL Injection Vulnerability (authentication Bypass / Over-diclosure)
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    const query = 'SELECT * FROM users WHERE Username = ? AND Password = ?';
    db.get(query, [username, password], (err, row) => {
        if (err) {
            res.status(500).send('Database error');
        } else if (row) {
            res.send(`Welcome ${row.Username}! You are logged in as ${row.role}.`);
        } else {
            res.send('Invalid username or password.');
        }
    });
});

// XSS and SQL Injection (search user)
app.get('/search', (req, res) => {
    const keyword = req.query.query;

    const query = `SELECT username, role FROM users WHERE Username LIKE '%${keyword}%'`;
    db.all(query, (err, rows) => {
        if (err) {
            res.status(500).send('Database error');
        } 

        let resultHtml = `<h2>Search Results for "${keyword}"</h2>`;

        if (rows && rows.length > 0) {
            resultHTML += `<ul>`;
            rows.forEach(row => {
                resultHTML += `<li>${user.username} - role: ${user.role}</li>`;
            });
            resultHTML += `</ul>`;
        } else {
            resultHtml += `<p>No users found.</p>`;
        }
        resultHTML += `<p><a href="/">Back</a></p>`;
        res.send(resultHtml);
    });
});

// welcome page
app.get('/welcome', (req, res) => {
    const user = req.query.user || 'Guest';

    res.send(`
    <html>
      <body style="font-family: Arial, sans-serif; padding: 50px;">
        <h1 style="color: green;">Welcome, ${user}!</h1>
        <p>You have successfully logged in to the development dashboard.</p>
        <p><a href="/">Logout</a></p>
      </body>
    </html>
  `);
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
