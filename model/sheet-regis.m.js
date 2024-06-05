const {PrismaClient} = require ('@prisma/client') ; 

const prisma = new PrismaClient () . $extends ({
    model : {
        phieudangkythanhvien
    }
})
module.exports = prisma.phieudangkythanhvien; 