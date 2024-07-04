const HttpsError = require("../model/error.m");

module.exports = {
    async checkCongTy (req,res,next){ 
        let userData = req.userData ; 
        if (userData.type != "Doanh Nghiệp") {
            return next (new HttpsError("Bạn không phải là công ty",400));
        }
        return next() ; 
    }, 
}