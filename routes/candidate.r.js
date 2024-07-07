const router = require ('express').Router() ; 
const {createCandidate, getByEmail, applyJob} = require('../controller/candidate.c')

router.post('/create', createCandidate) ; 
router.get('/get/:email', getByEmail);
router.get('/apply', applyJob)

module.exports = router; 