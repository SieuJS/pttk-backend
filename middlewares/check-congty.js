const HttpsError = require("../model/error.m");
const {PrismaClient} = require('@prisma/client')

const prisma = new PrismaClient(); 
module.exports = {
    async checkCongTy (req,res,next){ 
        let userData = req.userData ; 
        if (userData.type.toLowerCase() !== "doanh nghiệp") {
            return next (new HttpsError("Bạn không phải là công ty",400));
        }
        let user ; 
        try {
            user = await prisma.phieudangkythanhvien.findFirst({
                where : {
                    masothue : userData.username
                }
            })
            if (!user){
                return next (new HttpsError("Bạn không tồn tại trong hệ thống",400));
            }
            return next() ; 

        }
        catch (err) {
            return next (new HttpsError("Lỗi không xác định",500));
        }
    }, 
}