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
        sotienconlai : parseInt(tongtien),
        sodotthanhtoan : parseInt(sodotthanhtoan)
      },
    });

    res.status(201).json(newHoadon);
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ message: 'Lỗi khi tạo phiếu' });
  }
};

exports.doPayment = async (req, res,next) => {
  let {mahoadon , lanthanhtoan, sotienthanhtoan, loaithanhtoan} = req.body; 
  try {
    let hoadon = await prisma.hoadon.findFirst({
      where : {
        mahoadon : mahoadon
      }
    })
    if (!hoadon) {
      return next (new HttpsError ("Không tồn tại hoá đơn",422))
    }
    if (hoadon.trangthaithanhtoan) {
      return next (new HttpsError ("Hoá đơn đã được thanh toán rồi",422))

    }
    lanthanhtoan = parseInt(lanthanhtoan) ;

    if (lanthanhtoan !==  parseInt(hoadon.dotdathanhtoan) + 1) {
      return next (new HttpsError ("Sai đợt thanh toán hoá đơn",422))
    }
    sotienthanhtoan = parseInt(sotienthanhtoan) ; 
    await prisma.$transaction(async (tx) => {
      let thanhtoan = await tx.thanhtoan.create({
        data : {
          mahoadon : mahoadon ,
          lanthanhtoan : lanthanhtoan , 
          sotienthanhtoan : sotienthanhtoan,
          loaithanhtoan : loaithanhtoan,
          ngaythanhtoan : new Date().toISOString()
        }
      })
      let updateHoaDon ={
        dotdathanhtoan : lanthanhtoan,
        sotienconlai : hoadon.sotienconlai - sotienthanhtoan
      };
      console.log(lanthanhtoan)
      if (lanthanhtoan === 1) {
        let phieudangtuyen_ = await tx.phieudangtuyen.findFirst({
          where : {
            maphieudangtuyen : hoadon.phieudangtuyen
          }
        })
        let doanhnghiep_ = await tx.doanhnghiep.findFirst({
          where : {
            masothue : phieudangtuyen_.doanhnghiep
          }
        })
        await tx.tindangtuyen.create(
          {
            data : {
              matin : hoadon.phieudangtuyen,
              diachi : doanhnghiep_.diachi,
              congty : doanhnghiep_.tencongty,
              ten : doanhnghiep_.tencongty,
              vitri : phieudangtuyen_.vitridangtuyen,
              mota : phieudangtuyen_.mota,
              luong :  10000 * Math.random(),
              ngaydang : (new Date()).toISOString()
            }
          }
        )
      }

      if (lanthanhtoan === hoadon.sodotthanhtoan) {
        updateHoaDon = {
          ...updateHoaDon,
          trangthaithanhtoan : true
        }
      }
      let update = await tx.hoadon.update({
        where : {
          mahoadon : mahoadon
        },
        data : updateHoaDon
      })
      

    })
    return res.status(200).json({message : 'Giao dịch thành công'})

  }catch (err) {
    console.log(err);
    return next (new HttpsError('Lỗi khong xac định',500))
  }
}

// Helper function to generate a unique ID 


// ... (Add getPaymentById if you need to fetch individual payments)