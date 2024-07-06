const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient().$extends({
  model: {
    phieudangtuyen: {
      async tinhTongTien({ id }) { // Pass id as an object property
        const phieudangtuyen_ = await prisma.phieudangtuyen.findFirst({ // Await the findUnique operation
          where: {
            maphieudangtuyen: id,
          },
        });

        if (!phieudangtuyen_) {
          throw new Error("Not found");
        }

        let total = 0;
        const loaihinh_ = phieudangtuyen_.hinhthucdangtuyen.split(","); 
        
        for (let i = 0; i < loaihinh_.length; i++) { // Use a for loop for array iteration
          try {
            const dv = await prisma.dichvu.findFirst({
              where: {
                tendv: loaihinh_[i].trim().toLowerCase(), // Trim whitespace and convert to lowercase
                donvi: phieudangtuyen_.donvithoigian.toLowerCase(), 
              },
            });
            
            if (dv) { // Check if dv is found before using its properties
              total += dv.dongia * parseInt(phieudangtuyen_.khoangthoigiandangtuyen);
              console.log(total)
            } else {
              // Handle cases where no matching "dichvu" is found
              console.warn(`No matching "dichvu" found for tendv: ${loaihinh_[i]}`);
            }
          } catch (error) {
            // Handle errors gracefully, perhaps log them for debugging
            console.error("Error calculating total:", error); 
            throw error; 
          }
        }

        return total;
      },
    },
  },
});

module.exports = prisma.phieudangtuyen; 