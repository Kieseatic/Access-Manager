const serverless = require('serverless-http');
const express = require('express');
const dotenv = require('dotenv');
const pool = require('./database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const cors = require('cors');

dotenv.config();

console.log(crypto.randomBytes(64).toString('hex'));

const app = express();

app.use(express.json());
app.use(cors());

// Basic route to check server status
app.get('/', (req, res) => {
    res.send("Backend is running!");
});

// Middleware to authenticate JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret', (err, user) => {
        if (err) {
            console.error('JWT Verify Error: ', err);
            return res.status(403).json({ message: 'Invalid token' });
        }

        req.user = user;
        next();
    });
};

// Middleware to authorize role-based access
const authorizeRole = (role) => {
    return (req, res, next) => {
        if (!req.user || req.user.role !== role) {
            return res.status(403).json({ message: 'Access denied' });
        }
        next();
    };
};

// Get all users with optional filtering (admin-only)
app.get('/users', authenticateToken, authorizeRole('Admin'), async (req, res) => {
    try {
        const { page = 1, limit = 10, role, country } = req.query;
        const offset = (page - 1) * limit;

        let query = 'SELECT * FROM users';
        const queryParams = [];

        if (role || country) {
            query += ' WHERE';
            if (role) {
                queryParams.push(role);
                query += ` role = $${queryParams.length}`;
            }
            if (country) {
                if (queryParams.length > 0) query += ' AND';
                queryParams.push(country);
                query += ` country = $${queryParams.length}`;
            }
        }

        query += ` LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
        queryParams.push(limit, offset);

        const result = await pool.query(query, queryParams);
        const totalResult = await pool.query('SELECT COUNT(*) FROM users');

        res.json({
            users: result.rows,
            total: parseInt(totalResult.rows[0].count, 10),
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Register a new user
app.post('/register', async (req, res) => {
    const { name, email, password, country, role } = req.body;
    if (!name || !email || !password || !country || !role) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            'INSERT INTO users (name, email, password, country, role) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [name, email, hashedPassword, country, role]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Error registering user' });
    }
});

// Login a user and return token
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const user = result.rows[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET || 'your_jwt_secret',
            { expiresIn: '1h' }
        );

        res.json({ message: 'Login successful', token, role: user.role });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Restricted endpoint for Admins
app.get('/admin-only', authenticateToken, authorizeRole('Admin'), (req, res) => {
    res.json({ message: 'Welcome Admin!' });
});

// Fetch user data based on JWT
app.get('/user-data', authenticateToken, async (req, res) => {
    try {
        const user = req.user;

        const result = await pool.query(
            'SELECT name, email, country, role FROM users WHERE id = $1',
            [user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});
app.patch('/users/:id', async (req, res) => {
    const { id } = req.params;
    let { status } = req.body;

    // Convert 'active'/'inactive' strings to boolean
    if (status === 'active') {
        status = true;
    } else if (status === 'inactive') {
        status = false;
    } else {
        return res.status(400).json({ message: 'Invalid status value' });
    }

    try {
        const result = await pool.query(
            'UPDATE users SET status = $1 WHERE id = $2 RETURNING *',
            [status, id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'User status updated successfully', user: result.rows[0] });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ message: 'Internal server error. Please try again later.' });
    }
});



// Fetch statistics about user roles
app.get('/statistics', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT role, COUNT(*) AS count FROM users GROUP BY role'
        );

        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
module.exports.handler = serverless(app);
