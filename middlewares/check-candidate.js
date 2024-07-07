const HttpsError = require("../model/error.m");
const {PrismaClient} = require('@prisma/client')

const prisma = new PrismaClient(); 
module.exports = {
    async checkCandidate (req,res,next){ 
        let userData = req.userData ; 
        if (userData.type.toLowerCase() != "ứng viên") {
            return next (new HttpsError("Bạn không phải là ứng viên",400));
        }
        let user ; 
        try {
            user = await prisma.ungvien.findFirst({
                where : {
                    email : userData.username
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