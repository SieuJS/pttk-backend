const {PrismaClient} = require ("@prisma/client")


const prisma = new PrismaClient().$extends ({
    model : {
        nhanvien : {
            async taoNhanVien (manv , tennv, loainv) {
                let tonTaiNhanvien ; 
                try { 
                    if (!manv  || !tennv  || !loainv )
                        throw Error("Nhập thiếu dữ liệu")
                    tonTaiNhanvien = await this.findUnique({
                        where : {
                            manv : manv
                        }
                    })
                }catch (err) {
                    console.log ("Error in EMP model, line 16, ", err.message);
                    throw Error("Có lỗi xảy ra khi tạo nhân viên")
                }
                
                if (tonTaiNhanvien) throw Error("Nhân viên này đã tồn tại");
                
                let tkNhanVien  ; 
                try {
                    tkNhanVien = this.create ({
                        data : {
                            manv , 
                            tennv , 
                            loainv
                        }
                    })
                }catch (err) {
                    console.log ("Error in EMP model , line 34", err.message);
                    throw Error("Có lỗi xảy khi tạo nhân viên");
                }
                return tkNhanVien ; 
            }
        }
    }
})

module.exports = prisma.nhanvien;