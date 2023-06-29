const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userCreationController = require('./controller/userCreation');
const authenticationController = require('./controller/authenticationController');
const transactionController = require('./controller/transactionController');

require('dotenv').config();


const app = express();
app.use(express.json());

// Middleware to verify JWT token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        return res.sendStatus(401);
    }

    jwt.verify(token, '123', (err, user) => {
        if (err) {
            return res.sendStatus(403);
        }

        req.user = user;
        next();
    });
}

// API 1: User Creation
app.post('/api/users', userCreationController);
//API 2: authentication
app.post('/api/authenticate', authenticationController);
//API 3: transaction
app.post('/api/transaction', authenticateToken, transactionController)


// Start the server
const port = 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
