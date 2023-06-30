const bcrypt = require("bcrypt");
const pool = require('../config/db');
const jwt = require('jsonwebtoken');

const createUser = async (req, res) =>{
    try {
        const { first_name, last_name, email, phone_number, password } = req.body;

        // Validate required fields
        if (!first_name || first_name.trim().length === 0) {
            return res.status(400).json({error: 'First name is required'})
        }
        if (!last_name || last_name.trim().length === 0) {
            return res.status(400).json({error: 'last name is required'})
        }
        if (!email) {
            return res.status(400).json({error: 'Invalid email'})
        }
        if (!first_name) {
            return res.status(400).json({error: 'Invalid phone number'})
        }

        // Generate salt and hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Insert user into the database
        const connection = await pool.getConnection();
        const [results] = await connection.query(
            'INSERT INTO users (first_name, last_name, email, phone_number, password_salt, password_hash) VALUES (?, ?, ?, ?, ?, ?)',
            [first_name, last_name, email, phone_number, salt, passwordHash]
        );

        //generate jwt token
        // const token = jwt.sign({userId: results.id}, '123')

        const userId = results.insertId;
        res.status(201).json({ message: `User created successfully` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}
//validate mail phone number with regular expressions
// function isValidateEmail(email) {
//     const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
//     return emailRegex.test(email);
// }
//
// function isValidPhoneNumber(phone_number) {
//     const phoneNumberRegex = /^\d{10}$/;
//     return phoneNumberRegex.test(phone_number);
// }

module.exports =createUser;