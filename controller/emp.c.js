
const { empty } = require('@prisma/client/runtime/library');
const Account = require('../model/acc.m');
const NhanVien = require ('../model/emp.m')
const HttpsError = require('../model/error.m')

const provideJWT = require('../utils/access-token-generater')

async function createEmp (req, res, next) {

    const {empID, password, empName, empType } = req.body;
    let empAcc  ; 
    
    try {

        empAcc = await NhanVien.taoNhanVien (empID, empName, empType);
        empAcc = await Account.signUp(empID, password, "NV");
        
    } catch (err) {
        return next (
            new HttpsError (
                err.message?err.message : "Unknow Error" , 
                500
            )
        )
    }

    let accessToken = provideJWT(empAcc); 

    return res.status(200).json({
        message : "Account created",
        accessToken
    })
}

async function signIn (req, res,next) {
    const {empID, password} = req.body ; 
    let account ;
    try {
        account = await Account.signIn(empID, password);
    }
    catch (err ) {
        // 406 - not accept 
        return  next (new HttpsError(err.message, 406))
    }

    let accessToken = provideJWT(account)

    return res.status(200).json({
        accessToken,
        message : "Sign in success"
    })

}


module.exports = {
    createEmp,
    signIn
}

