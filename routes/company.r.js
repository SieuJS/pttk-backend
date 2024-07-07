const router = require('express').Router() ; 
const checkAuth = require ("../middlewares/check-auth")
// import middlewares 
const paginate = require('express-paginate');

const {kiemTraNhanVienTiepNhan} = require("../middlewares/check-nhanvien");
const {checkCongTy} = require('../middlewares/check-congty')
const {getInfor,validInfor} = require('../controller/company.c');
const { check } = require('express-validator');
const {getHiringForCompany} = require('../controller/hiring-sheet.c')

router.use(paginate.middleware(10, 50));


router.get ('/', (req,res,next) => {
    res.status(200).json({
        message : "Well come to resfull api path for company"
    })
}) 


router.get('/infor',checkAuth,checkCongTy,getInfor);
router.get('/validate/:masothue', validInfor);
router.post('/get/hiring-sheet',checkAuth,checkCongTy,getHiringForCompany)

module.exports = router ; 