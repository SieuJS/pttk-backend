const {PrismaClient} = require('@prisma/client');
const HttpsError = require('../model/error.m');
const prisma = new PrismaClient()
const paginate = require('express-paginate');


exports.manipulateApplySheet = async (req,res,next) => {
    const {maphieuungtuyen , maungvien, lydo} = req.body ;
    let {action} = req.params;
    let data;
    if (action === 'approve') {
        data = {
            trangthai : 'đã duyệt',
            thongbao : 'Đơn đã duyệt thành công'
        }
    }
    else if (action === 'reject') { 
        data = {
            trangthai : 'từ chối',
            thongbao : lydo
        }
    }
    else return next (new HttpsError('Chưa có thao tác',422));
    try {
        let result = await prisma.phieudangkyungtuyen.update(
            {
                where : {
                    maphieuungtuyen_maungvien : {
                        maphieuungtuyen : maphieuungtuyen,
                        maungvien : maungvien
                    }
                },
                data : {
                    ...data
                }
            }
        )

        if (!result) {
            return next(new HttpsError (
                'Không tồn tại phiếu với thông tin được đưa',422
            ))
        }
        return res.status(200).json({message : "Lấy thông tin" , data : {
            ...result
        }})
    }
    catch(err) {
        console.log(err)
        return next (new HttpsError('Lỗi không xác định khi duyệt phiếu',500));
    }
}

exports.getInforApplySheet = async (req, res, next) => {
    const {maphieuungtuyen , maungvien} = req.query ;
    try {
        let result = await prisma.phieudangkyungtuyen.findFirst({
            where : {
                maphieuungtuyen : maphieuungtuyen ,
                maungvien : maungvien 
            }
        })

        if (!result) {
            return next(new HttpsError (
                'Không tồn tại phiếu với thông tin được đưa',422
            ))
        }
        return res.status(200).json({message : "Lấy thông tin" , data : {
            ...result
        }
        })

    }catch (error) {    
        console.log(error) ;
        return next(new HttpsError('Lỗi không xác định khi thực hiện thông tin',500 ))
    }
}

exports.searchApplySheet = async (req,res,next) => {

    const {maphieuungtuyen, ngaydangtuyen, maungvien} = req.body ; 

    let {page, limit} = req.query; 

    const whereClause = {} ;

    if (maphieuungtuyen) {
        whereClause.maphieuungtuyen = {contains : maphieuungtuyen, mode : 'insensitive'} ;
    }

    if (maungvien) {
        whereClause.maungvien = {contains : maungvien, mode : 'insensitive'};
    }

    try {
        const totalCount = await prisma.phieudangkyungtuyen.count({where : whereClause}); 
        const results = await prisma.phieudangkyungtuyen.findMany ({
            where : whereClause,
            skip : req.skip,
            take : limit || 3
        })
    
        const pageCount = Math.ceil(totalCount/limit);
        res.json({
            object : 'list' , 
            has_more: paginate.hasNextPages(req)(pageCount),
            data: results,
            total: totalCount,
            pageCount,
            currentPage: page,
            currentPageSize: results.length
        })

    }

    catch (err) {
        console.log(err)
        return next(new HttpsError('Unknow'))
    }



    const applySheet = await prisma.phieudangkyungtuyen.findMany()
}