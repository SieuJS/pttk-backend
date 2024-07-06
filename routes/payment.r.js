const {check} = require('express-validator')
const router = require('express').Router() ; 
const checkAuth = require('../middlewares/check-auth')
const {kiemTraNhanVienTiepNhan} = require ('../middlewares/check-nhanvien');
const paginate = require('express-paginate')
router.get('/',(req,res,next) => {res.json({message:"hello"})})






