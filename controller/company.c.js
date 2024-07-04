const { PrismaClient } = require("@prisma/client");
const HttpsError = require("../model/error.m");

const genID = require('../utils/unique-key-gen');
const Account = require ('../model/acc.m')

const prisma = new PrismaClient();

const getInfor = async (req, res, next) => { 
    const {username} = req.userData; 
    
    try { 
        let phieudangky = await prisma.phieudangkythanhvien.findFirst({
            where : {
                masothue : username
            }
        })
        if (!phieudangky) {
            return next (new HttpsError("Không tìm thấy phiếu",422))
        }

        let tinhtrang ;
        if (!phieudangky.nhanvientiepnhan) {
            tinhtrang = "Chưa tiếp nhận";
        }
        else if (!phieudangky.ngayxetduyet) {
            tinhtrang = "Chưa xét duyệt";
        }
        else {
            tinhtrang = "Đã duyệt"
        }

        return res.status(200).json({
            message : "Lấy thông tin phiếu của " + username + " thành công",
            data : {
                ...phieudangky,
                tinhtrang
            }
        })
        
    }
    catch (error) {
        return next(new HttpsError("Lỗi không xác định", 500))
    }
}

async function validInfor (req,res,next) {
    const {masothue} = req.params; 
    try {
        let doanhnghiep_ = await prisma.doanhnghiep.findFirst({
            where : {
                masothue : masothue
            }
        })

        if ( !doanhnghiep_) {
            return next (new HttpsError('Không tìm thấy doanh nghiệp trong hệ thống',422))
        }
        return res.status(200).json(
            {
                message : "Doanh nghiệp hợp lệ",
                data : {
                    ...doanhnghiep_
                }
            }
        )
    }catch (err){
        return next(new HttpsError("Lỗi không xác định khi tìm thông tin doanh nghiệp", 500));
    }
}


module.exports ={
    getInfor,
    validInfor

};
