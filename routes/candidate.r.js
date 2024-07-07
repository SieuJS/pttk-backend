const router = require ('express').Router() ; 
const {createCandidate, getByEmail, applyJob, isApplied} = require('../controller/candidate.c')
const checkAuth = require('../middlewares/check-auth');
const {checkCandidate} = require('../middlewares/check-candidate')
router.post('/create', createCandidate) ; 
router.get('/get/:email', getByEmail);
router.post('/apply/:maphieudangtuyen',checkAuth, checkCandidate,applyJob);
router.get('/check-apply/:maphieuungtuyen', checkAuth, checkCandidate,isApplied)

module.exports = router; 