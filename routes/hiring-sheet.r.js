const express = require('express');
const paginate = require('express-paginate');
const { body, validationResult } = require('express-validator');
const hiringSheetController = require('../controller/hiring-sheet.c'); 
const router = express.Router();

router.use(paginate.middleware(10, 50));

router.get('/get/:maphieudangky', hiringSheetController.getHiringSheetById);

router.post('/create',
  [
    body('doanhnghiep').notEmpty().withMessage('Mã số thuế không được bỏ trống'),
    body('vitridangtuyen').notEmpty().withMessage('Vị trí ứng tuyển không được bỏ trống'),
    body('soluongtuyendung').isInt({ gt: 0 }).withMessage('Số lượng phải lớn hơn 0'),
    body('khoangthoigiandangtuyen').notEmpty().withMessage('Khoảng thời gian không được bỏ trống'),
    body('thoigiandangtuyen').isISO8601().withMessage('Thời gian không hợp lệ'),
    body('mota').notEmpty().withMessage('Thông tin yêu cầu không được bỏ trống'),
  ],
  hiringSheetController.createHiringSheet
);

router.post('/search', hiringSheetController.searchHiringSheets);

module.exports = router;