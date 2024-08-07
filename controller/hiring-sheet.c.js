const { PrismaClient } = require('@prisma/client');
const genID = require('../utils/unique-key-gen');
const HttpsError = require('../model/error.m');
const {validationResult} = require('express-validator');
const paginate = require('express-paginate');
const prisma = new PrismaClient();
const PhieuDangTuyen = require('../model/hiring-sheet')

exports.createHiringSheet = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let errorMessage = errors.array().concat(',');
    return res.status(400).json({ message : errorMessage });
  }

  let { doanhnghiep, vitridangtuyen, soluongtuyendung, khoangthoigiandangtuyen, 
    donvithoigian, thoigiandangtuyen, hinhthucdangtuyen, mota, yeucau, luong } = req.body;

  try {
    let existsComp = await prisma.doanhnghiep.findFirst({
      where: {
        masothue: doanhnghiep
      }
    });

    if (!existsComp) {
      return next(new HttpsError("Mã số thuế không tồn tại", 422));
    }

    let maphieudangtuyen = "PDT" + genID();
    yeucau = await JSON.stringify(yeucau)
    const newSheet = await prisma.phieudangtuyen.create({
      data: {
        maphieudangtuyen,
        doanhnghiep,
        vitridangtuyen,
        soluongtuyendung: parseInt(soluongtuyendung),
        khoangthoigiandangtuyen: parseInt(khoangthoigiandangtuyen),
        donvithoigian,
        thoigiandangtuyen: new Date(thoigiandangtuyen).toISOString(), 
        hinhthucdangtuyen: hinhthucdangtuyen.join(','),
        thoigiantao: new Date().toISOString(),
        mota,
        luong : parseInt(luong),
        yeucau,
        trangthaithanhtoan: null,
      },
    });

    res.status(201).json({ message: "Tạo phiếu thành công", data: newSheet });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error creating hiring sheet');
  }
};

exports.editHiringSheet = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let errorMessage = errors.array().concat(',');
    return res.status(400).json({ message: errorMessage });
  }

  const sheetId = req.params.id; // Assuming you're passing the sheet ID in the request parameters
  let {
    doanhnghiep,
    vitridangtuyen,
    soluongtuyendung,
    khoangthoigiandangtuyen,
    donvithoigian,
    thoigiandangtuyen,
    hinhthucdangtuyen,
    mota,
    yeucau,
    luong,
  } = req.body;

  try {
    // Check if the company exists
    let existsComp = await prisma.doanhnghiep.findFirst({
      where: {
        masothue: doanhnghiep,
      },
    });

    if (!existsComp) {
      return next(new HttpsError('Mã số thuế không tồn tại', 422));
    }
    
    // Check if the hiring sheet exists
    const existingSheet = await prisma.phieudangtuyen.findUnique({
      where: {
        maphieudangtuyen: sheetId,
      },
    });

    if (!existingSheet) {
      return next(new HttpsError('Không tìm thấy phiếu đăng tuyển', 404));
    }

    yeucau = await JSON.stringify(yeucau);

    // Update the hiring sheet
    const updatedSheet = await prisma.phieudangtuyen.update({
      where: {
        maphieudangtuyen: sheetId,
      },
      data: {
        doanhnghiep,
        vitridangtuyen,
        soluongtuyendung: parseInt(soluongtuyendung),
        khoangthoigiandangtuyen: parseInt(khoangthoigiandangtuyen),
        donvithoigian,
        thoigiandangtuyen: new Date(thoigiandangtuyen).toISOString(),
        hinhthucdangtuyen: hinhthucdangtuyen.join(','),
        mota,
        luong: parseInt(luong),
        yeucau, 
        // Note: You might not want to update 'trangthaithanhtoan' here.
        // Consider handling payment status updates separately.
      },
    });

    res.status(200).json({
      message: 'Cập nhật phiếu đăng tuyển thành công',
      data: updatedSheet,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Lỗi khi cập nhật phiếu đăng tuyển');
  }
};

exports.searchHiringSheets = async (req, res) => {
  try {
    const { maphieudangtuyen, doanhnghiep, vitridangtuyen } = req.body;
    let { page, limit } = req.query;
    const whereClause = {};

    if (maphieudangtuyen) {
      whereClause.maphieudangtuyen = { contains: maphieudangtuyen, mode: 'insensitive' };
    }

    if (doanhnghiep) {
      whereClause.doanhnghiep = { contains: doanhnghiep, mode: 'insensitive' };
    }

    if (vitridangtuyen) {
      whereClause.vitridangtuyen = { contains: vitridangtuyen, mode: 'insensitive' };
    }

    const totalCount = await prisma.phieudangtuyen.count({ where: whereClause });
    const results = await prisma.phieudangtuyen.findMany({
      where: whereClause,
      skip: req.skip,
      take: limit || 3,
    });

    const pageCount = Math.ceil(totalCount / req.query.limit);
    res.json({
      object: 'list',
      has_more: paginate.hasNextPages(req)(pageCount),
      data: results,
      total: totalCount,
      pageCount,
      currentPage: page,
      currentPageSize: results.length
    });
  } catch (error) {
    console.error('Error searching data:', error);
    res.status(500).json({ error: 'Failed to search data' });
  }
};

exports.searchPostedHiring = async (req, res,next ) => {
  try {
    const { matin, congty, diachi } = req.body;
    let { page, limit } = req.query;
    const whereClause = {};

    if (matin) {
      whereClause.matin = { contains: matin, mode: 'insensitive' };
    }

    if (congty) {
      whereClause.congty = { contains: congty, mode: 'insensitive' };
    }

    if (diachi) {
      whereClause.vitridangtuyen = { contains: diachi, mode: 'insensitive' };
    }

    const totalCount = await prisma.tindangtuyen.count({ where: whereClause });
    const results = await prisma.tindangtuyen.findMany({
      where: whereClause,
      skip: req.skip,
      take: limit || 3,
    });

    const pageCount = Math.ceil(totalCount / req.query.limit);
    res.json({
      object: 'list',
      has_more: paginate.hasNextPages(req)(pageCount),
      data: results,
      total: totalCount,
      pageCount,
      currentPage: page,
      currentPageSize: results.length
    });
  } catch (error) {
    console.error('Error searching data:', error);
    res.status(500).json({ error: 'Failed to search data' });
  }
}

exports.getHiringSheetById = async (req, res) => {
  try {
    const { maphieudangky } = req.params;

    const hiringSheet = await prisma.phieudangtuyen.findUnique({
      where: {
        maphieudangtuyen: maphieudangky, // Assuming maphieudangky is the correct field
      },
    });

    if (!hiringSheet) {
      return res.status(404).json({ message: 'Không tìm thấy phiếu đăng ký' });
    }
    let hinhthucdangtuyen = hiringSheet.hinhthucdangtuyen.split(',');
    let yeucau = JSON.parse(hiringSheet.yeucau)
    res.status(200).json({
      message : "Thấy thông tin thành công",
      data : {
        ...hiringSheet,
        hinhthucdangtuyen,
        yeucau
      }
    });
  } catch (error) {
    console.error('Error fetching hiring sheet:', error);
    res.status(500).json({ error: 'Lỗi khi lấy thông tin phiếu đăng ký' });
  }
};

exports.estimatePrice =async (req,res,next) => {
  let {maphieudangtuyen} = req.params; 
  try {
    let price = await PhieuDangTuyen.tinhTongTien(maphieudangtuyen) ; 
    return res.json({message : "Tính tiền thành công", data : {total : price}})
  }
  catch (err) {
    console.log(err)
    return next (new HttpsError('Lỗi khi tính tiền',500))
  }
}


exports.getHiringForCompany = async (req, res,next ) => {
  let masothue = req.userData.username;
  try {
    const { maphieudangtuyen, doanhnghiep, vitridangtuyen } = req.body;
    let { page, limit } = req.query;
    const whereClause = {};

    let company = await prisma.doanhnghiep.findUnique({
      where : {
          masothue : masothue
      }
    })
    if (!company) {
      return next (new HttpsError("Bạn không tồn tại trong hệ thống",400));
    }

    if (maphieudangtuyen) {
      whereClause.maphieudangtuyen = { contains: maphieudangtuyen, mode: 'insensitive' };
    }

    if (doanhnghiep) {
      whereClause.doanhnghiep = { contains: doanhnghiep, mode: 'insensitive' };
    }

    if (vitridangtuyen) {
      whereClause.vitridangtuyen = { contains: vitridangtuyen, mode: 'insensitive' };
    }

    const totalCount = await prisma.phieudangtuyen.count({ where: whereClause });
    const results = await prisma.phieudangtuyen.findMany({
      where: {
        ...whereClause,
        doanhnghiep : masothue
      },
      skip: req.skip,
      take: limit || 3,
    });

    const pageCount = Math.ceil(totalCount / req.query.limit);
    res.json({
      object: 'list',
      has_more: paginate.hasNextPages(req)(pageCount),
      data: results,
      total: totalCount,
      pageCount,
      currentPage: page,
      currentPageSize: results.length
    });
  } catch (error) {
    console.error('Error searching data:', error);
    res.status(500).json({ error: 'Failed to search data' });
  }
}

exports.getHiringForWeb = async (req,res,next) => {
  
}