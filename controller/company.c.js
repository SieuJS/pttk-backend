const { PrismaClient } = require("@prisma/client");
const HttpsError = require("../model/error.m");

const genID = require('../utils/unique-key-gen');

const prisma = new PrismaClient();


async function  tiepNhanPhieuDangKy (req, res, next ) { 
    const {
        masothue, tencongty, nguoidaidien, diachi, email
    } = req.body ; 

    let userData = req.userData;
    try{ 
        let existsComp = await prisma.doanhnghiep.findUnique({
            where : {
                masothue : masothue 
            }
        })

        if (existsComp) 
            return next (new HttpsError("Mã số thuế đã tồn tại!!!!", 400))

        let maphieu = "PTV" + genID(); 
        const phieuDangKy = await prisma.phieudangkythanhvien.create({
            data : {
                maphieudangky : maphieu,
                ngaydangky : new Date(),
                ngayxetduyet : null,
                masothue : masothue , 
                tencongty : tencongty,
                nguoidaidien : nguoidaidien ,
                diachi : diachi, 
                email : email , 
                nhanvientiepnhan : userData.username
            }
        })
        return res.status(200).json({
            message : "Lập phiếu thành công",
            phieuDangKy
        })
    }catch (error) {
        console.log("Compnay.c line 31" , error.message) ; 
        return next (new HttpsError("Lỗi không xác định khi tiếp nhận phiếu "), 500)
    }   
}
module.exports ={tiepNhanPhieuDangKy};
