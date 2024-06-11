const {check} = require('express-validator')
const router = require('express').Router() ; 
const {createSheet} = require('../controller/regis-sheet.c')

router.post ('/create', 
    check('masothue').not().isEmpty(),
    check('tencongty').notEmpty(),
    check('nguoidaidien').notEmpty(),
    check('diachi').notEmpty(), 
    check('email').notEmpty().isEmail(),
    check('matkhau').isLength({min:5, max : 30}),
    createSheet
)

module.exports = router;