const router = require ('express').Router() ; 
const {createCandidate, getByEmail, applyJob, isApplied, getApplySheet} = require('../controller/candidate.c')
const paginate = require('express-paginate');

const checkAuth = require('../middlewares/check-auth');
const {checkCandidate} = require('../middlewares/check-candidate');


router.use(paginate.middleware(10, 50));
router.post('/apply-sheet/get',checkAuth, getApplySheet);
router.post('/create', createCandidate) ; 
router.get('/get/:email', getByEmail);
router.post('/apply/:maphieudangtuyen',checkAuth, checkCandidate,applyJob);
router.get('/check-apply/:maphieuungtuyen', checkAuth, checkCandidate,isApplied)



module.exports = router; 