require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Product = require('../models/Product');
const Settings = require('../models/Settings');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    await Settings.deleteMany({});

    // Seed Users
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('admin123', salt);
    const staffPassword = await bcrypt.hash('staff123', salt);

    await User.create([
      { username: 'admin', passwordHash: adminPassword, role: 'admin', name: 'Admin User' },
      { username: 'staff', passwordHash: staffPassword, role: 'staff', name: 'Staff User' }
    ]);

    // Seed Settings
    await Settings.create({
      shopName: 'Pavan Mobile World',
      ownerName: 'Pavan Kumar',
      phone: '9123456789',
      whatsapp: '9123456789',
      address: 'Main Road, Rajamahendravaram, Andhra Pradesh',
      gstin: '37XXXXX0000X1ZX'
    });

    // Seed Products
    const products = [
      { name: 'Tempered Glass', emoji: '🔮', category: 'Screen Protection', price: 99, costPrice: 40, stock: 50, sku: 'SKU001', status: 'active' },
      { name: 'TPU Phone Cover', emoji: '📱', category: 'Cases & Covers', price: 149, costPrice: 60, stock: 40, sku: 'SKU002', status: 'active' },
      { name: 'Type-C Cable', emoji: '🔌', category: 'Cables & Chargers', price: 99, costPrice: 35, stock: 100, sku: 'SKU003', status: 'active' },
      { name: 'Fast Charger 20W', emoji: '🔋', category: 'Cables & Chargers', price: 249, costPrice: 120, stock: 30, sku: 'SKU004', status: 'active' },
      { name: 'Wired Earphones', emoji: '🎧', category: 'Audio', price: 199, costPrice: 80, stock: 25, sku: 'SKU005', status: 'active' },
      { name: 'Designer Back Cover', emoji: '🛡️', category: 'Cases & Covers', price: 129, costPrice: 50, stock: 35, sku: 'SKU006', status: 'active' },
      { name: 'Matte Screen Guard', emoji: '💎', category: 'Screen Protection', price: 79, costPrice: 30, stock: 60, sku: 'SKU007', status: 'active' },
      { name: 'Power Bank 10000mAh', emoji: '⚡', category: 'Power', price: 699, costPrice: 450, stock: 10, sku: 'SKU008', status: 'inactive' },
      { name: 'OTG Adapter', emoji: '🔗', category: 'Accessories', price: 69, costPrice: 20, stock: 100, sku: 'SKU009', status: 'active' },
      { name: 'Mobile Holder', emoji: '🗂️', category: 'Accessories', price: 89, costPrice: 35, stock: 45, sku: 'SKU010', status: 'active' },
      { name: 'TWS Earbuds', emoji: '🎵', category: 'Audio', price: 499, costPrice: 300, stock: 15, sku: 'SKU011', status: 'active' },
      { name: 'Lightning Cable', emoji: '⚡', category: 'Cables & Chargers', price: 129, costPrice: 50, stock: 50, sku: 'SKU012', status: 'active' },
      { name: 'Selfie Ring Light', emoji: '💡', category: 'Accessories', price: 299, costPrice: 150, stock: 12, sku: 'SKU013', status: 'active' },
      { name: '4-Port USB Hub', emoji: '🖥️', category: 'Accessories', price: 199, costPrice: 100, stock: 8, sku: 'SKU014', status: 'active' }
    ];

    await Product.create(products);

    console.log('Database seeded successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error seeding database: ${error.message}`);
    process.exit(1);
  }
};

seed();
