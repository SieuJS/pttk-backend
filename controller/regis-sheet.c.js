const {PrismaClient} = require ('@prisma/client')

const HttpsError = require('../model/error.m')

const {validationResult} = require('express-validator')

const getAll = async (req,res,next) => {
    let data ; 
    const prisma = new PrismaClient() ;
    try {
        data = await prisma.phieudangkythanhvien.findMany({})
        if (!data) return next (new HttpsError("Không tìm thấy phiếu nào trong hệ thống", 404));
        
        return res.status(200).json({
            message : "Lấy tất cả phiếu đăng ký thành công",
            data
        })

    }catch (err) {
        console.log(err); 
        return next (new HttpsError("Lỗi không xác định",500))
    }
}

const getUncensor = async (req,res,next) => {
    let data ; 
    const prisma = new PrismaClient() ;
    try {
        data = await prisma.phieudangkythanhvien.findMany({
            where: {
                ngayxetduyet : null
            }
        })
        if (!data) return next (new HttpsError("Không tìm thấy phiếu nào trong hệ thống", 404));
        
        return res.status(200).json({
            message : "Lấy phiếu đăng ký thành công",
            data
        })

    }catch (err) {
        console.log(err); 
        return next (new HttpsError("Lỗi không xác định",500))
    }
}

const createSheet = async (req,res,next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next (new HttpsError("Thông tin đăng nhập không đủ hoặc sai",422))
    }
    const {
        masothue, tencongty, nguoidaidien, diachi, email, matkhau
    } = req.body ; 

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
                nhanvientiepnhan : null
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


module.exports = {
    getAll,
    getUncensor,
    createSheet
}