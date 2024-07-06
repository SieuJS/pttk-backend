const { PrismaClient } = require('@prisma/client');
const genID = require('../utils/unique-key-gen');
const PhieuDangTuyen = require('../model/hiring-sheet')
const {validationResult} = require('express-validator');
const HttpsError = require('../model/error.m');

const prisma = new PrismaClient();

// Helper Function: Calculate Total Payment
exports.getPaymentByHiring = async (req,res,next) =>{
  let {maphieudangtuyen} = req.params;
  try {
    
    let hoadon = await prisma.hoadon.findFirst({
      where : {
        phieudangtuyen : maphieudangtuyen
      }
    })

    if (!hoadon) {
      return next (new HttpsError('Phiếu đăng tuyển này chưa có hoá đơn',420))
    }

    return  res.status(200).json({message : "Lấy thông tin hoá đơn thành công", data : hoadon})
  }
  catch(err){
    console.log(err)
    return next(new HttpsError('Lỗi không xác địn khi xem hoá đơn',500))
  }
}

// Create a new payment
exports.createPayment = async (req, res,next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({message : "Nhập sai" , errors: errors.array() });
    }

    const { maphieudangtuyen, sodotthanhtoan } = req.body;

    let hoadon = await prisma.hoadon.findFirst({
      where : {
        phieudangtuyen : maphieudangtuyen
      }
    })

    if (hoadon) {
      return next (new HttpsError('Phiếu đăng tuyển này đã có hoá đơn',420))
    }


    let tongtien = await PhieuDangTuyen.tinhTongTien(maphieudangtuyen) ;



    const mahoadon = 'HD' + genID(); 



    // 4. Create the Invoice (hoadon)
    const newHoadon = await prisma.hoadon.create({
      data: {
        mahoadon,
        tongtien,
        phieudangtuyen: maphieudangtuyen,
        dotdathanhtoan : 0,
        sotienlai : parseInt(tongtien),
        sodotthanhtoan : parseInt(sodotthanhtoan)
      },
    });

    res.status(201).json(newHoadon);
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ message: 'Lỗi khi tạo phiếu' });
  }
};

// Get all payments (with pagination - implement as needed)
exports.getAllPayments = async (req, res) => {
  try {
    // ... (Add pagination logic here using req.query) 

    const payments = await prisma.hoadon.findMany({
      // ... (Apply pagination, sorting, filtering here)
    });

    res.json(payments);
  } catch (error) {
    // ... (Handle errors)
  }
};

// Helper function to generate a unique ID 


// ... (Add getPaymentById if you need to fetch individual payments)