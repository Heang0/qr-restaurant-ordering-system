const jwt = require('jsonwebtoken');
const config = require('../config');

const generateToken = (payload) => {
    return jwt.sign(payload, config.jwtSecret, {
        expiresIn: '1h' // Token expires in 1 hour
    });
};

module.exports = { generateToken };