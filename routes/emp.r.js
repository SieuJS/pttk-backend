const router = require('express').Router();
const {createEmp, signIn} = require('../controller/emp.c')

router.post ('/create/', createEmp) ; 
router.post ('/signin', signIn);

router.get('/', (req,res,next) => {
    res.status(200).json({
        message : "Wellcome to employee api calls"
    })
})

module.exports = router ; 