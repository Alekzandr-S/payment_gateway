const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require('../config/db');


const authenticateUser =async (req, res) =>{
    try {
        const { email, password } = req.body;
        console.log(process.env.DB_USERNAME)
        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Retrieve user from the database
        const connection = await pool.getConnection();
        const [results] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);
        connection.release();

        const user = results[0];

        // Check if user exists and compare passwords
        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user.id }, '123', { expiresIn: '1h' });

        res.json({token});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}
module.exports = authenticateUser;