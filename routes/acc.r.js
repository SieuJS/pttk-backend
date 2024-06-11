const router = require('express').Router() ; 
const {signIn,signUp} = require('../controller/acc.c')

router.post('/signin', signIn);


module.exports = router ;