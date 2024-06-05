const router = require('express').Router() ; 

router.get ('/', (req,res,next) => {
    res.status(200).json({
        message : "Well come to resfull api path for company"
    })
}) 

module.exports = router ; 