const HttpsError = require('../model/error.m');
const {PrismaClient} = require('@prisma/client')
const genID = require('../utils/unique-key-gen');
const provideJWTToken = require('../utils/access-token-generater');
const prisma = new PrismaClient(); 
const Account = require('../model/acc.m')
exports.createCandidate = async (req, res, next) => {
    const {matkhau, cccd, hoten, sdt, email, diachi} = req.body ; 
    
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
            return next (new HttpsError ('Đã tồn tại thông tin trong hệ thống',422))
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
    const {maphieuungtuyen} = req.params
    try {
    await prisma.phieudangkyungtuyen.create({
        data : {
            maphieuungtuyen : maphieuungtuyen,
            maungvien : userData.username
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