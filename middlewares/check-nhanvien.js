const HttpError = require("../model/error.m");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function kiemTraNhanVien (manv, chucdanh) {
    let nhanvien;
    try {
      nhanvien = await prisma.nhanvien.findUnique({
        where: {
          manv: manv,
        },
        select: {
          manv: true,
          tennv: true,
          loainv: true,
        },
      });

      if (nhanvien.loainv.toLowerCase() !== chucdanh.toLowerCase()) {
        return false;
      }
    } catch (error) {
      console.log("middlewares/check-nhanvien.js line 27", error.message);
        throw error
    }
    return true;

}

async function kiemTraNhanVienTiepNhan(req, res, next) {
    let userData = req.userData;

    if (userData.type != "NV") {
      return next( new HttpError("Bạn không phải là nhân viên", 400));
    }
    if ( await kiemTraNhanVien(userData.username, "Nhân viên tiếp nhận")){

        return next ();
    }
    else return next (new HttpError("Bạn không phải là nhân viên tiếp nhận"), 400);
};
  

async function kiemTraNhanVienThanhToan (req, res,next) {
    let userData = req.userData;
    if (userData.type != "NV") {
      return next( new HttpError("Bạn không phải là nhân viên", 400));
    }
    if (kiemTraNhanVien(userData.username, "Nhân viên tiếp nhận")){
        return next ();
    }
    else return next (new HttpError("Bạn không phải là nhân viên thanh toán"), 400);
}


module.exports ={
    kiemTraNhanVienTiepNhan,
    kiemTraNhanVienThanhToan
}
