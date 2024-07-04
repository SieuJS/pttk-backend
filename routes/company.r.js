const router = require('express').Router() ; 
const checkAuth = require ("../middlewares/check-auth")
// import middlewares 
const {kiemTraNhanVienTiepNhan} = require("../middlewares/check-nhanvien");
const {checkCongTy} = require('../middlewares/check-congty')
const {getInfor,validInfor} = require('../controller/company.c')

router.get ('/', (req,res,next) => {
    res.status(200).json({
        message : "Well come to resfull api path for company"
    })
}) 


router.get('/infor',checkAuth,checkCongTy,getInfor);
router.get('/validate/:masothue', validInfor);

module.exports = router ; 