const express = require('express');
const paginate = require('express-paginate');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const ApplySheet = require('../controller/apply-sheet.c')
router.use(paginate.middleware(10, 50));

router.post('/search', ApplySheet.searchApplySheet)
router.get('/get', ApplySheet.getInforApplySheet)
router.post('/action/:action',ApplySheet.manipulateApplySheet)

module.exports = router;