const {check} = require('express-validator')
const router = require('express').Router() ; 
const checkAuth = require('../middlewares/check-auth')
const {kiemTraNhanVienTiepNhan} = require ('../middlewares/check-nhanvien');
const paginate = require('express-paginate')
const {createPayment,getPaymentByHiring, doPayment}= require('../controller/payment.c')
router.get('/',(req,res,next) => {res.json({message:"hello"})})
const { body, validationResult } = require('express-validator');


router.post('/create',[
    body('maphieudangtuyen').notEmpty().withMessage('Mã số thuế không được bỏ trống'),
    body('sodotthanhtoan').isNumeric().withMessage('Thiếu số đợt thanh toán')
] ,createPayment)


router.get('/getbyhiring/:maphieudangtuyen',getPaymentByHiring);

router.post('/pay', doPayment);

module.exports = router;
