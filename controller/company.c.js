const { PrismaClient } = require("@prisma/client");
const HttpsError = require("../model/error.m");

const genID = require('../utils/unique-key-gen');
const Account = require ('../model/acc.m')

const prisma = new PrismaClient();


async function  tiepNhanPhieuDangKy (req, res, next ) { 
    const {
        masothue, tencongty, nguoidaidien, diachi, email, matkhau
    } = req.body ; 

    if (!masothue || !tencongty || !nguoidaidien || !diachi || !email ||!matkhau) {
        return next (new HttpsError("Chưa đủ thông tin",422))
    }

    let userData = req.userData;
    try{ 
        let existsComp = await prisma.phieudangkythanhvien.findFirst({
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

        const tkDoanhNghiep = await Account.signUp(masothue,matkhau,'Doanh Nghiệp');

        return res.status(200).json({
            message : "Lập phiếu và tạo tài khoản thành công",
            phieuDangKy
        })
    }catch (error) {
        console.log("Compnay.c line 31" , error.message) ; 
        return next (new HttpsError("Lỗi không xác định khi tiếp nhận phiếu "), 500)
    }   
}

async function duyetDoanhNghiep (req,res,next) {

    const {maphieu} = req.params;
    let sessionUser = req.userData ; 
    try {
        const phieuDangKy = await prisma.phieudangkythanhvien.findUnique({
            where : {
                maphieudangky : maphieu
            }
        })
        if (sessionUser.username.trim().toLowerCase() !== phieuDangKy.nhanvientiepnhan.trim().toLowerCase()) {
            return next (new HttpsError("Bạn không phải là nhân viên đã tiếp nhận phiếu này", 400));
        }

        if (phieuDangKy.ngayxetduyet) {
            return next (new HttpsError("Phiếu đã được duyệt rồi",400))
        }
        await prisma.phieudangkythanhvien.update({
            where : {
                maphieudangky : maphieu
            },
            data : {
                ngayxetduyet : new Date()
            }
        })

        const doanhnghiep = await prisma.doanhnghiep.create({
            data : {
                masothue : phieuDangKy.masothue,
                maphieudangky : phieuDangKy.maphieudangky,
                tencongty : phieuDangKy .tencongty,
                nguoidaidien : phieuDangKy.nguoidaidien,
                diachi : phieuDangKy.diachi ,
                email : phieuDangKy.email
            }
        })
    
        return res.status(500).json({message : "Duyệt phiếu thành công", doanhnghiep })
    }catch ( err) {
        console.log("Company.c.js line 72", err);
        return next (new HttpsError("Có lỗi khi duyệt phiếu"))
    }

}

module.exports ={
    tiepNhanPhieuDangKy,
    duyetDoanhNghiep,

};
