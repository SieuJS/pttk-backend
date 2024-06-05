const router = require('express').Router() ; 
const checkAuth = require ("../middlewares/check-auth")
// import middlewares 
const {kiemTraNhanVienTiepNhan} = require("../middlewares/check-nhanvien")
const {tiepNhanPhieuDangKy} = require('../controller/company.c')

router.get ('/', (req,res,next) => {
    res.status(200).json({
        message : "Well come to resfull api path for company"
    })
}) 

router.post('/dangky',checkAuth,kiemTraNhanVienTiepNhan, tiepNhanPhieuDangKy )

module.exports = router ; 