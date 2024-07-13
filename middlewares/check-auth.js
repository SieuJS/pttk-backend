const HttpError = require('../model/error.m')

const jwt = require('jsonwebtoken')

require('dotenv').config() ;
const privateKey = process.env.PRIVATE_KEY; 

module.exports = function (req, res, next )  {

    if(req.method === "OPTIONS"){
        return next();
    }

    try {
        const authHeaders = req.headers.authorization// authorization : "Bear Token" 
        if(!authHeaders) {
            const error = new Error('Authentication failed');
            throw error;
        }
        const token = authHeaders.split(' ')[1];
        if(!token) {
            const error = new Error('Authentication failed');
            throw error;
        }
        const decodedToken = jwt.verify(token , privateKey);
        req.userData  =  {
            ...decodedToken
        }  
        return next();

    }catch (err) {
        return next (new HttpError(err.message, 401));
    }
};