const { PrismaClient } = require('@prisma/client');
const genID = require('../utils/unique-key-gen');

const prisma = new PrismaClient();

// Helper Function: Calculate Total Payment
async function calculateTotalPayment(phieudangtuyen) {
    try {
        let phieudangtuyen_ = prisma.phieudangtuyen.findFirst({
            where : {
                maphieudangtuyen : phieudangtuyen
            }
        });

        if (!phieudangtuyen_) {
            
        }
    }catch (err){
        console.log(err)
    }
}

// Create a new payment
exports.createPayment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { maphieudangtuyen, sodotthanhtoan, } = req.body;

    // 1. Fetch Job Posting Details
    const phieudangtuyen = await prisma.phieudangtuyen.findUnique({
      where: { maphieudangtuyen },
    });
    if (!phieudangtuyen) {
      return res.status(404).json({ error: 'Job posting not found' });
    }

    // 2. Calculate Total Payment
    const tongtien = await calculateTotalPayment(phieudangtuyen);

    // 3. Generate Invoice ID (mahoadon) - use a robust method
    const mahoadon = 'HD' + genID(); 

    // 4. Create the Invoice (hoadon)
    const newHoadon = await prisma.hoadon.create({
      data: {
        mahoadon,
        tongtien,
        maphieudangtuyen: maphieudangtuyen,
        dathanhtoan : false,
        sotienlai : tongtien,
        sodotthanhtoan : sodotthanhtoan
      },
    });

    res.status(201).json(newHoadon);
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ error: 'Failed to create payment' });
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