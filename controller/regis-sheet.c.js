const {PrismaClient} = require ('@prisma/client')

const HttpsError = require('../model/error.m')

const {validationResult, Result} = require('express-validator')
const prisma = new PrismaClient() ;
const genID = require('../utils/unique-key-gen');
const Account = require('../model/acc.m');
const { paginate } = require('express-paginate');


const getAll = async (req,res,next) => {
    let data ; 
    try {
        data = await prisma.phieudangkythanhvien.findMany({
            
            skip : req.skip,
            take : req.query.limit,

        }
        )   
        const itemCount = await prisma.phieudangkythanhvien.count({where : {
            
        }}); 
        const pageCount = Math.ceil(itemCount/req.query.limit)
        return res.status(200).json({
            message : "Lấy tất cả phiếu đăng ký thành công",
            data : {
                sheets : data.rows,
                pageCount,
                itemCount,
                pages : paginate.getArrayPages(req) (3,pageCount,req,query.page)
            }
        })

    }catch (err) {
        console.log(err); 
        return next (new HttpsError("Lỗi không xác định",500))
    }
}

const getUncensor = async (req,res,next) => {
    let data ; 
    try {
        data = await prisma.phieudangkythanhvien.findMany({
            where: {
                ngayxetduyet : null
            }
        })
        
        return res.status(200).json({
            message : "Lấy phiếu đăng ký thành công",
            data
        })

    }catch (err) {
        console.log(err); 
        return next (new HttpsError("Lỗi không xác định",500))
    }
}

const getUnReceived = async (req,res,next) => {
    let data ; 
    try {
        data = await prisma.phieudangkythanhvien.findMany({
            where : {
                nhanvientiepnhan : null
            }
        })
        return res.status(200).json({
            message : "Lấy phiếu chưa tiếp nhận thành công",
            data
        })
    }catch(err) {
        console.log(err); 
        return next (new HttpsError("Lỗi không xác định",500))
    }
}

const getReceived = async (req,res,next) => {
    let {username} = req.userData;
    let data ; 
    try {
        data = await prisma.phieudangkythanhvien.findMany({
            where : {
                nhanvientiepnhan : username
            }
        })
        return res.status(200).json({
            message : "Lấy phiếu tiếp nhận của nhân viên " + username,
            data 
        })

    }catch (error) {
        console.log(err); 
        return next (new HttpsError("Lỗi không xác định",500))
    }
} ;

const createSheet = async (req,res,next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next (new HttpsError("Thông tin đăng ký không đủ hoặc sai",422))
    }
    const {
        masothue, tencongty, nguoidaidien, diachi, email, matkhau
    } = req.body ; 

    try{ 
        let existsComp = await prisma.phieudangkythanhvien.findFirst({
            where : {
                masothue : masothue 
            }
        })

        if (existsComp) 
            return next (new HttpsError("Mã số thuế đã tồn tại!!!!", 400))
        const {phieuDangKy,tkDoanhNghiep} = await prisma.$transaction(async (tx) => {
            let maphieu = "PTV" + genID(); 
            let phieuDangKy;
            let tkDoanhNghiep;
            phieuDangKy = await tx.phieudangkythanhvien.create({
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
            });
            tkDoanhNghiep = await Account.signUp(masothue,matkhau,'Doanh Nghiệp');
            return {tkDoanhNghiep, phieuDangKy}
        })

        return res.status(200).json({
            message : "Lập phiếu và tạo tài khoản thành công",
            phieuDangKy,
            account : tkDoanhNghiep
        })
    }catch (error) {
        console.log("Compnay.c line 31" , error.message) ; 
        return next (new HttpsError("Lỗi không xác định khi tiếp nhận phiếu "), 500)
    }   
}

const receiveSheet = async (req,res,next) => {
    const {sheetid} = req.params
    const userData = req.userData;
    try {
        await prisma.phieudangkythanhvien.update(
            {
                where: {maphieudangky : sheetid},
                data : {nhanvientiepnhan : userData.username}
            }
        )
        return res.status(200).json({
            message : `${userData.username} tiếp nhận thành công phiếu`,
        })
    }catch (error) {
        return next (new HttpsError("Có lỗi không xác định xảy trong qus trình tiếp nhận phiếu",500))
    }
}

const approveSheet = async (req,res,next) => {
    const {sheetid} = req.params;
    let sessionUser = req.userData ; 
    try {
        const phieuDangKy = await prisma.phieudangkythanhvien.findUnique({
            where : {
                maphieudangky : sheetid
            }
        })
        if (!phieuDangKy) return next (new HttpsError("Không tồn tại phiếu",422))
        if (sessionUser.username.trim().toLowerCase() !== phieuDangKy.nhanvientiepnhan.trim().toLowerCase()) {
            return next (new HttpsError("Bạn không phải là nhân viên đã tiếp nhận phiếu này", 400));
        }

        if (phieuDangKy.ngayxetduyet) {
            return next (new HttpsError("Phiếu đã được duyệt rồi",400))
        }
        let doanhnghiep = 
        await prisma.$transaction(async (tx) => {
            await tx.phieudangkythanhvien.update({
                where : {
                    maphieudangky : sheetid
                },
                data : {
                    ngayxetduyet : new Date()
                }
            })
    
            const doanhnghiep = await tx.doanhnghiep.create({
                data : {
                    masothue : phieuDangKy.masothue,
                    maphieudangky : phieuDangKy.maphieudangky,
                    tencongty : phieuDangKy.tencongty,
                    nguoidaidien : phieuDangKy.nguoidaidien,
                    diachi : phieuDangKy.diachi ,
                    email : phieuDangKy.email
                }
            })
            return doanhnghiep;
        })

        return res.status(200).json({message : "Duyệt phiếu thành công", doanhnghiep })
    }catch ( err) {
        console.log("Company.c.js line 72", err);
        return next (new HttpsError("Có lỗi khi duyệt phiếu"))
    }
}



module.exports = {
    getAll,
    getUncensor,
    getUnReceived,
    createSheet,
    receiveSheet,
    approveSheet,
    getReceived
}