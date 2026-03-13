const Bill = require('../models/Bill');
const Product = require('../models/Product');

// @desc    Get dashboard stats
// @route   GET /api/dashboard/stats
// @access  Private/Admin
const getStats = async (req, res) => {
  try {
    const totalBills = await Bill.countDocuments();
    
    const revenueData = await Bill.aggregate([
      { $group: { _id: null, total: { $sum: "$total" } } }
    ]);
    const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayBills = await Bill.countDocuments({ createdAt: { $gte: todayStart } });

    const avgBillValue = totalBills > 0 ? totalRevenue / totalBills : 0;

    const activeProducts = await Product.countDocuments({ status: 'active' });
    const inactiveProducts = await Product.countDocuments({ status: 'inactive' });
    
    const lowStockProducts = await Product.countDocuments({ 
      status: 'active', 
      $expr: { $lte: ["$stock", "$minStockAlert"] },
      stock: { $gt: 0 }
    });
    
    const outOfStockProducts = await Product.countDocuments({ 
      status: 'active', 
      stock: 0 
    });

    res.json({
      totalBills,
      totalRevenue,
      todayBills,
      avgBillValue,
      activeProducts,
      inactiveProducts,
      lowStockProducts,
      outOfStockProducts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get stock counts by category
// @route   GET /api/dashboard/category-stock
// @access  Private/Admin
const getCategoryStock = async (req, res) => {
  try {
    const stockByCategory = await Product.aggregate([
      { $group: { _id: "$category", stock: { $sum: "$stock" } } },
      { $project: { category: "$_id", stock: 1, _id: 0 } }
    ]);
    res.json(stockByCategory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get recent bills
// @route   GET /api/dashboard/recent-bills
// @access  Private/Admin
const getRecentBills = async (req, res) => {
  try {
    const bills = await Bill.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .select('billNo customerName total paymentMode createdAt');
    res.json(bills);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getStats,
  getCategoryStock,
  getRecentBills
};
