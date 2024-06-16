const {check} = require('express-validator')
const router = require('express').Router() ; 
const {createSheet, receiveSheet, getAll, getUncensor, approveSheet, getUnReceived, getReceived} = require('../controller/regis-sheet.c')
const checkAuth = require('../middlewares/check-auth')
const {kiemTraNhanVienTiepNhan} = require ('../middlewares/check-nhanvien');
const paginate = require('express-paginate')
const {PrismaClient} = require ('@prisma/client')
const HttpsError = require('../model/error.m')
router.get('/',(req,res,next) => {res.json({message:"hello"})})
const prisma = new PrismaClient() ;


router.use(paginate.middleware(10,50));
router.get('/get-all',async (req,res,next)=>{
    let data ; 
    const {page, limit} = req.query;
    try {
        data = await prisma.phieudangkythanhvien.findMany({
            
            skip : req.skip,
            take : limit,
        }
        )   
        const itemCount = await prisma.phieudangkythanhvien.count({where : {}}); 
        const pageCount = Math.ceil(itemCount/limit)
        return res.status(200).json({
            message : "Lấy tất cả phiếu đăng ký thành công",
            data : {
                sheets : data,
                pageCount,
                itemCount,
                pages : paginate.getArrayPages(req) (3,pageCount,page)
            }
        })

    }catch (err) {
        console.log(err); 
        return next (new HttpsError("Lỗi không xác định",500))
    }
    
});
router.get('/get-unapproved',checkAuth,kiemTraNhanVienTiepNhan, async (req,res,next) => {
    let data ; 
    const {page, limit} = req.query;

    let {username} = req.userData;
    try {
        data = await prisma.phieudangkythanhvien.findMany({
            where: {
                ngayxetduyet : null,
                nhanvientiepnhan : username
            }
        })
        const itemCount = await prisma.phieudangkythanhvien.count({where : {
            ngayxetduyet : null,
            nhanvientiepnhan : username
        }}); 

        const pageCount = Math.ceil(itemCount/limit)
        return res.status(200).json({
            message : "Lấy tất cả phiếu đăng ký thành công",
            data : {
                sheets : data,
                pageCount,
                itemCount,
                pages : paginate.getArrayPages(req) (3,pageCount,page)
            }
        })

    }catch (err) {
        console.log(err); 
        return next (new HttpsError("Lỗi không xác định",500))
    }
});
router.get('/get-unreceived', checkAuth, kiemTraNhanVienTiepNhan,async (req,res,next) => {
    let data ; 

    const {page, limit} = req.query;

    try {
        data = await prisma.phieudangkythanhvien.findMany({
            where: {
                nhanvientiepnhan : null
            }
        })
        const itemCount = await prisma.phieudangkythanhvien.count({where : {
            nhanvientiepnhan: null
        }}); 

        const pageCount = Math.ceil(itemCount/limit)
        return res.status(200).json({
            message : "Lấy tất cả phiếu đăng ký thành công",
            data : {
                sheets : data,
                pageCount,
                itemCount,
                pages : paginate.getArrayPages(req) (3,pageCount,page)
            }
        })

    }catch (err) {
        console.log(err); 
        return next (new HttpsError("Lỗi không xác định",500))
    }
})
router.get('/get-approved', checkAuth,kiemTraNhanVienTiepNhan,async (req,res,next) => {
    let {username} = req.userData;
    let data ; 
    const {page, limit} = req.query;

    try {
        data = await prisma.phieudangkythanhvien.findMany({
            where : {
            nhanvientiepnhan : username,
            NOT : {ngayxetduyet : null},
            }
        })

        const itemCount = await prisma.phieudangkythanhvien.count({where : {
            NOT : {ngayxetduyet : null},
            nhanvientiepnhan : username
        }}); 
        const pageCount = Math.ceil(itemCount/limit)
        return res.status(200).json({
            message : "Lấy tất cả phiếu đăng ký thành công",
            data : {
                sheets : data,
                pageCount,
                itemCount,
                pages : paginate.getArrayPages(req) (3,pageCount,page)
            }
        })

    }catch (error) {
        console.log(err); 
        return next (new HttpsError("Lỗi không xác định",500))
    }
})

router.post ('/create', 
    check('masothue').not().isEmpty(),
    check('tencongty').notEmpty(),
    check('nguoidaidien').notEmpty(),
    check('diachi').notEmpty(), 
    check('email').notEmpty().isEmail(),
    check('matkhau').isLength({min:5, max : 30}),
    createSheet
)

router.post('/receive/:sheetid', checkAuth, kiemTraNhanVienTiepNhan, receiveSheet);

router.post('/approve/:sheetid',checkAuth,kiemTraNhanVienTiepNhan,approveSheet);



module.exports = router;