const HttpsError = require('../model/error.m');
const {PrismaClient} = require('@prisma/client')
const genID = require('../utils/unique-key-gen');
const provideJWTToken = require('../utils/access-token-generater');
const prisma = new PrismaClient(); 
const Account = require('../model/acc.m')
exports.createCandidate = async (req, res, next) => {
    const {matkhau, cccd, hoten, sdt, email, diachi, gioitinh} = req.body ; 
    
    try { 
        let existsEmail = await prisma.ungvien.findFirst({
            where : {
                OR : [
                {email : email},
                {cccd : cccd}
                ]
            }
        })
        if ( existsEmail) {
            return next (new HttpsError ('Đã tồn tại email hoặc cccd trong hệ thống',422))
        }
        const {account , accessToken} = await prisma.$transaction(async (tx) => {
            let ungvien_; 
            let maungvien = 'UV' + genID();
            ungvien_ = await tx.ungvien.create ({
                data : {
                    cccd : cccd,
                    email : email,
                    hoten : hoten ,
                    diachi : diachi ,
                    maungvien : maungvien,
                    gioitinh : gioitinh,
                    sdt : sdt
                }
            })
            let account = await Account.signUp(email , matkhau, 'Ứng viên');

            const accessToken = provideJWTToken(account);
            return {accessToken, account}
        })
        return res.status(200).json({
            message : "Tại phiếu thành công" , 
            account : account,
            accessToken : accessToken
        })

    }
    catch (err){
        console.log(err) ;
        return next(new HttpsError('Lỗi không xác định khi tạo tài khoản ứng viên',500))
    }
}

exports.getByEmail = async (req,res,next) => {
    const {email} = req.params; 
    try {
        let ungvien_ = await prisma.ungvien.findFirst({
            where : {
                email : email
            }
        })
        if (!ungvien_) {
            return next (new HttpsError('Không tồn tại email', 422)) ;
        }
        return res.status(200).json({
            message : "Lấy thông tin thành công" ,
            data : {
                ...ungvien_
            }
        })
    }
    catch (err) {
        console.log(err) ; 
        return next (new HttpsError('Lỗi không xác định',500)); 
    }
}

exports.applyJob = async (req,res,next) => {
    const userData = req.userData; 
    const {maphieudangtuyen, cv} = req.params
    try {
    console.log(cv)
    await prisma.phieudangkyungtuyen.create({
        data : {
            maphieuungtuyen : maphieudangtuyen,
            maungvien : userData.username,
            cv : cv,
            trangthai : 'đang xét duyệt',
            thongbao : 'thông tin đang được xử lý bởi nhân viên'
        }
    })
        return res.status(200).json({message : "Đăng ký ứng tuyển thành công"
        })
    }
    catch (err) {
        console.log(err)
        return next(new HttpsError('Lỗi khi đăng ký'))
    }
}

exports.isApplied = async (req,res,next) => {
    const userData = req.userData; 
    const {maphieuungtuyen} = req.params;
    try {
        let uv_ = await prisma.phieudangkyungtuyen.findMany({
            where : {
                maungvien : userData.username
            }
        })
        let has  = [];
        has = uv_.filter(u => {return u.maphieuungtuyen === maphieuungtuyen})
        if (!uv_ || has.length === 0) {
            return res.status(200).json({message : "Chưa đăng tuyển", isApplied : false})
        }

        return res.status(200).json({message : "Đã đăng tuyển", isApplied : true})
    }
    catch (err) {
        console.log(err);
        return next (new HttpsError('Đã applied rồi',500));
    }
} 

exports.getApplySheet = async (req, res, next) => {
    const {maungvien} = req.userData.username;
    try {
        let result = await prisma.phieudangkyungtuyen.findMany()
    }catch(err) {
        console .log(err)
        return next (new HttpsError('Lỗi không xác định ',500))
    }
}