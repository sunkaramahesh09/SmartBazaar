require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Category = require('./models/Category');
const Product = require('./models/Product');
const Store = require('./models/Store');
const Inventory = require('./models/Inventory');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('📦 Seeding database...');

  // Clear
  await Promise.all([
    User.deleteMany({}), Category.deleteMany({}),
    Product.deleteMany({}), Store.deleteMany({}), Inventory.deleteMany({})
  ]);

  // Admin user
  const admin = await User.create({
    name: 'Admin', email: process.env.ADMIN_EMAIL || 'admin@smartbazaar.com',
    password: process.env.ADMIN_PASSWORD || 'Admin@1234', role: 'admin'
  });
  console.log('✅ Admin:', admin.email);

  // Sample user
  await User.create({ name: 'Mahesh Kumar', email: 'mahesh@example.com', password: 'User@1234', role: 'user' });

  // Categories
  const cats = await Category.insertMany([
    { name: 'Fruits & Vegetables', description: 'Fresh farm produce' },
    { name: 'Dairy & Eggs',        description: 'Milk, cheese, eggs and more' },
    { name: 'Snacks & Beverages',  description: 'Chips, drinks and snacks' },
    { name: 'Grains & Pulses',     description: 'Rice, dal, atta and more' },
    { name: 'Household',           description: 'Cleaning and home essentials' },
    { name: 'Personal Care',       description: 'Soaps, shampoos, and care products' },
    { name: 'Meat & Seafood',      description: 'Fresh chicken, fish and mutton' },
    { name: 'Spices & Masalas',    description: 'Fresh spices and ready masalas' },
  ]);
  console.log('✅ Categories:', cats.length);

  const catMap = Object.fromEntries(cats.map(c => [c.name, c._id]));

  // Products
  const products = await Product.insertMany([
    { name: 'Tomato', price: 30, mrp: 40, stock: 100, unit: 'kg', category: catMap['Fruits & Vegetables'], isFeatured: true, brand: 'Farm Fresh', tags: ['vegetable', 'fresh'], threshold: 20 },
    { name: 'Onion',  price: 25, mrp: 35, stock: 150, unit: 'kg', category: catMap['Fruits & Vegetables'], isFeatured: false, tags: ['vegetable', 'daily'], threshold: 20 },
    { name: 'Potato', price: 20, mrp: 28, stock: 200, unit: 'kg', category: catMap['Fruits & Vegetables'], isFeatured: true, tags: ['vegetable', 'daily'], threshold: 30 },
    { name: 'Banana', price: 40, mrp: 50, stock: 80,  unit: 'dozen', category: catMap['Fruits & Vegetables'], isFeatured: true, tags: ['fruit', 'fresh'], threshold: 10 },
    { name: 'Amul Milk 500ml', price: 28, mrp: 30, stock: 50, unit: 'piece', category: catMap['Dairy & Eggs'], isFeatured: true, brand: 'Amul', tags: ['dairy', 'daily'], threshold: 10 },
    { name: 'Eggs (6 pack)',   price: 55, mrp: 60, stock: 40, unit: 'pack', category: catMap['Dairy & Eggs'], isFeatured: false, tags: ['protein', 'daily'], threshold: 5 },
    { name: 'Lays Classic Salted', price: 20, mrp: 20, stock: 60, unit: 'pack', category: catMap['Snacks & Beverages'], isFeatured: false, brand: 'Lays', tags: ['snack', 'chips'], threshold: 10 },
    { name: 'Sprite 750ml',   price: 38, mrp: 40, stock: 45, unit: 'piece', category: catMap['Snacks & Beverages'], isFeatured: true, brand: 'Coca-Cola', tags: ['beverage', 'cold drink'], threshold: 8 },
    { name: 'Basmati Rice 1kg', price: 90, mrp: 110, stock: 75, unit: 'kg', category: catMap['Grains & Pulses'], isFeatured: true, brand: 'India Gate', tags: ['rice', 'staple'], threshold: 15 },
    { name: 'Toor Dal 500g',  price: 65, mrp: 75, stock: 60, unit: 'pack', category: catMap['Grains & Pulses'], isFeatured: false, tags: ['dal', 'protein'], threshold: 10 },
    { name: 'Chicken Masala 100g', price: 45, mrp: 50, stock: 30, unit: 'pack', category: catMap['Spices & Masalas'], isFeatured: true, brand: 'MDH', tags: ['masala', 'spice', 'chicken'], threshold: 5 },
    { name: 'Turmeric Powder 200g', price: 35, mrp: 40, stock: 50, unit: 'pack', category: catMap['Spices & Masalas'], isFeatured: false, brand: 'Everest', tags: ['spice', 'turmeric'], threshold: 8 },
    { name: 'Chicken Breast 500g', price: 180, mrp: 200, stock: 20, unit: 'pack', category: catMap['Meat & Seafood'], isFeatured: true, tags: ['chicken', 'protein', 'fresh'], threshold: 5 },
    { name: 'Soap - Dove 100g',    price: 60, mrp: 65, stock: 80, unit: 'piece', category: catMap['Personal Care'], isFeatured: false, brand: 'Dove', tags: ['soap', 'hygiene'], threshold: 15 },
    { name: 'Surf Excel Matic 1kg', price: 185, mrp: 195, stock: 35, unit: 'piece', category: catMap['Household'], isFeatured: false, brand: 'Surf Excel', tags: ['detergent', 'laundry'], threshold: 8 },
  ]);
  console.log('✅ Products:', products.length);

  // Inventory records
  await Inventory.insertMany(products.map(p => ({
    product: p._id, currentStock: p.stock, threshold: p.threshold
  })));
  console.log('✅ Inventory synced');

  // Stores
  await Store.insertMany([
    { name: 'Smart Bazaar Ameerpet', address: { street: '45 Ameerpet Main Road', city: 'Hyderabad', state: 'Telangana', pincode: '500016' }, phone: '+91 98765 43210', timings: { open: '08:00 AM', close: '09:00 PM' } },
    { name: 'Smart Bazaar Kukatpally', address: { street: '12 KPHB Colony, Kukatpally', city: 'Hyderabad', state: 'Telangana', pincode: '500072' }, phone: '+91 98765 43211', timings: { open: '07:00 AM', close: '10:00 PM' } },
    { name: 'Smart Bazaar Banjara Hills', address: { street: 'Road No. 10, Banjara Hills', city: 'Hyderabad', state: 'Telangana', pincode: '500034' }, phone: '+91 98765 43212', timings: { open: '09:00 AM', close: '08:30 PM' } },
  ]);
  console.log('✅ Stores:', 3);

  console.log('\n🎉 Seed complete!');
  console.log('👤 Admin login: admin@smartbazaar.com / Admin@1234');
  console.log('👤 User login:  mahesh@example.com / User@1234');
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
