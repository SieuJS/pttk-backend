
require('dotenv').config();

const express = require('express')
const cors = require('cors')
// import routes 
const EmpRoute = require('./routes/emp.r');
const CompRoute = require('./routes/company.r');
const AccRoute = require('./routes/acc.r');
const RegisSheetRoute = require('./routes/regis-sheet.r')
const HiringSheetRoute = require('./routes/hiring-sheet.r')
const PaymentRoute = require('./routes/payment.r')
// import model
const HttpsError = require('./model/error.m');


const PORT = process.env.PORT;

const app = express();
app.use(cors());

app.use(express.json());


app.use('/api/auth', AccRoute);

app.use('/api/emp', EmpRoute);

app.use ('/api/company' ,CompRoute);

app.use('/api/regis-sheet', RegisSheetRoute);

app.use('/api/hiring-sheet', HiringSheetRoute )

app.use('/api/payment' , PaymentRoute)

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

