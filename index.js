
require('dotenv').config();

const express = require('express')

// import routes 
const EmpRoute = require('./routes/emp.r');
const CompRoute = require('./routes/company.r')
// import model
const HttpsError = require('./model/error.m');


const PORT = process.env.PORT;

const app = express();

app.use(express.json());

app.use('/api/emp', EmpRoute);

app.use ('/api/company' ,CompRoute);


// Error routing handling 
/**
 * @param {HttpsError} error The error
 */
app.use( (error , req, res, next) => {
    // Check that Have the res been sent ?
    if(res.headerSent) {
        return next(error);
    }
    // Check the status and set it 
    res.status(error.code || 500);
    // Leave the message 
    res.json({message : error.message || "Unknown error occured"})
})

app.listen(PORT , ()=> {
    console.log('App running on port ', PORT);
})

