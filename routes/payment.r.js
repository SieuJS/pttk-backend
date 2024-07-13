const {check} = require('express-validator')
const router = require('express').Router() ; 
const checkAuth = require('../middlewares/check-auth')
const {kiemTraNhanVienTiepNhan} = require ('../middlewares/check-nhanvien');
const paginate = require('express-paginate')
const {createPayment,getPaymentByHiring, doPayment, getPaymentDetail}= require('../controller/payment.c')
const { body, validationResult } = require('express-validator');


router.post('/create',[
    body('maphieudangtuyen').notEmpty().withMessage('Mã số thuế không được bỏ trống'),
    body('sodotthanhtoan').isNumeric().withMessage('Thiếu số đợt thanh toán')
] ,createPayment)

router.get('/getbyhiring/:maphieudangtuyen',getPaymentByHiring);

router.post('/pay', doPayment);
router.get('/bills/:mahoadon',getPaymentDetail)

module.exports = router;
