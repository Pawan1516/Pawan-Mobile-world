const Bill = require('../models/Bill');
const Product = require('../models/Product');
const Settings = require('../models/Settings');

// @desc    Get all bills
// @route   GET /api/bills
// @access  Private/Admin
const getBills = async (req, res) => {
  const { search, payment, from, to } = req.query;
  let query = {};

  if (search) {
    query.$or = [
      { billNo: { $regex: search, $options: 'i' } },
      { customerName: { $regex: search, $options: 'i' } },
      { customerPhone: { $regex: search, $options: 'i' } }
    ];
  }

  if (payment && payment !== 'All') {
    query.paymentMode = payment;
  }

  if (from || to) {
    query.createdAt = {};
    if (from) query.createdAt.$gte = new Date(from);
    if (to) query.createdAt.$lte = new Date(to);
  }

  const bills = await Bill.find(query).sort({ createdAt: -1 }).populate('createdBy', 'name');
  res.json(bills);
};

// @desc    Get single bill
// @route   GET /api/bills/:id
// @access  Private
const getBillById = async (req, res) => {
  const bill = await Bill.findById(req.params.id).populate('createdBy', 'name');

  if (bill) {
    res.json(bill);
  } else {
    res.status(404).json({ message: 'Bill not found' });
  }
};

// @desc    Create bill
// @route   POST /api/bills
// @access  Private
const createBill = async (req, res) => {
  const {
    customerName, customerPhone, customerEmail,
    items, subtotal, discount, gstPercent,
    gstAmount, total, paymentMode, notes, pdfTheme
  } = req.body;

  if (!items || items.length === 0) {
    res.status(400).json({ message: 'No items in bill' });
    return;
  }

  // Generate Bill No: PMW + 5 digits
  const billCount = await Bill.countDocuments();
  const billNo = `PMW${String(billCount + 1).padStart(5, '0')}`;

  const bill = await Bill.create({
    billNo,
    customerName,
    customerPhone,
    customerEmail,
    items,
    subtotal,
    discount,
    gstPercent,
    gstAmount,
    total,
    paymentMode,
    notes,
    pdfTheme,
    createdBy: req.user._id
  });

  if (bill) {
    // Auto stock decrement if enabled in settings
    const settings = await Settings.findOne();
    if (!settings || settings.autoStockDecrement) {
      for (const item of items) {
        if (item.productId) {
          await Product.findByIdAndUpdate(item.productId, {
            $inc: { stock: -item.qty }
          });
        }
      }
    }

    res.status(201).json(bill);
  } else {
    res.status(400).json({ message: 'Invalid bill data' });
  }
};

// @desc    Export bills as CSV
// @route   GET /api/bills/export/csv
// @access  Private/Admin
const exportCSV = async (req, res) => {
  try {
    const bills = await Bill.find({}).sort({ createdAt: -1 });

    let csv = 'Bill No,Date,Customer Name,Phone,Subtotal,Discount,GST Amount,Total,Payment Mode\n';

    bills.forEach(bill => {
      const date = new Date(bill.createdAt).toLocaleDateString();
      csv += `${bill.billNo},${date},"${bill.customerName}",${bill.customerPhone},${bill.subtotal},${bill.discount},${bill.gstAmount},${bill.total},${bill.paymentMode}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=PavanMobileWorld_Bills.csv');
    res.status(200).send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getBills,
  getBillById,
  createBill,
  exportCSV
};
