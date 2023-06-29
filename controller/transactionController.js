const pool = require('../config/db');
const axios = require('axios')
async function transaction(req, res) {
    try {
        const { userId, phone_number, amount } = req.body;

        // Validate required fields
        if (!phone_number || phone_number.length !== 10) {
            return res.status(400).json({ message: 'Phone number is invalid' });
        }

        //Validate amount
        if (!amount) {
            return res.status(400).json({ message: 'Enter a valid amount'})
        }

        //Format amount
        const formattedAmount = parseFloat(amount).toFixed(2);

        // Extract MNO from phone number
        const mnoPrefix = phone_number.substring(0,3);
        if(mnoPrefix !== '097' && mnoPrefix !== '077' && mnoPrefix !== '096' && mnoPrefix !== '066' && mnoPrefix !== '095'){
            res.status(400).json({ message: 'Invalid phone number'})
        }

        //Slice and prefix phone number
        let modifiedNumber = phone_number;
        if (phone_number.startsWith('097') || phone_number.startsWith('077')) {
            modifiedNumber = phone_number.slice(1);
        }else if (phone_number.startsWith('096') || phone_number.startsWith('095')) {
            modifiedNumber = `26${phone_number}`;
        }

        //Assign service provider to mno
        //Determine the API endpoint based on MNO code
        let serviceProvider = '';
        let acknowledge = '';
        let apiEndPoint;
        switch (mnoPrefix) {
            case '097' || '077' :
                serviceProvider = 'airtel';
                break
            case '096':
                serviceProvider = 'mtn';
                break;
            case '095':
                serviceProvider = 'zamtel';
                break;
            default:
                return res.status(400).json({message: 'Invalid MNO code'})
        }


        // Consume another API gateway based on MNO
        axios
            .post(`http://api-gateway-${mno}.com/transaction`, phone_number)
            .then((response) => {
                //response for api gateway
                res.json({message:"Appropriate response "});
            })
            .catch((error) => {
                //errors from API gateway
                res.json(error);
            });

        //
        await pool.query(
            'INSERT INTO transactions (userId, formattedAmount) VALUES' +
            '(?, ?) ON DUPLICATE KEY UPDATE userId = ?, amount = ?',
            [userId, formattedAmount]
        );

        const responsePayload = {
            message: 'Transaction successful',
            formattedAmount,
            modifiedNumber
        }

        res.json(responsePayload);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}
// function validatePhoneNumber(phoneNumber) {
//     // Remove any non-digit characters from the phone number
//     const digitsOnly = phoneNumber.replace(/\D/g, '');
//
//     // Check if the resulting string has exactly 10 digits
//     if (digitsOnly.length === 10) {
//         return true; // Phone number is valid
//     }
//
//     return false; // Phone number is not valid
// }
//
// const phoneNumber = '123-456-7890'; // Example phone number to validate
//
// if (validatePhoneNumber(phoneNumber)) {
//     console.log('Phone number is valid');
//     // Continue with your logic
// } else {
//     console.error('Invalid phone number');
//     // Handle validation error
// }

module.exports = transaction;