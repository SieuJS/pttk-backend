require('dotenv').config();

const jwt = require('jsonwebtoken') ; 
const privateKey = process.env.PRIVATE_KEY;


function provideJWTToken (data) {
    let accessToken = jwt.sign(
        data , privateKey, 
        {
            expiresIn : '1h'
        }
    )
    return accessToken; 
}

module.exports = provideJWTToken ; 