require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

//  NETLIFY CORS - SPECIFIC ORIGINS (FIRST LINE)
app.use(cors({
  origin: [
    'https://crm-mern-eosin.vercel.app',  
    'http://localhost:5173',                      // Vite dev server
    'https://crm-mern-kdbb.onrender.com'          // Render
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

//  BODY PARSERS
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

//  MONGODB 
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log(' MongoDB Connected'))
  .catch(err => console.log(' MongoDB Error:', err.message));

//  SCHEMAS
const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  password: String
});
const User = mongoose.model('User', UserSchema);

const CustomerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: String,
  phone: String,
  company: String,
  address: String
}, { timestamps: true });
const Customer = mongoose.model('Customer', CustomerSchema);

//  AUTH MIDDLEWARE
const authMiddleware = (req, res, next) => {
  const authHeader = req.header('Authorization') || req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'crm-super-secret-2026');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

//  ROOT + FRONTEND ROUTES (FIXED 404 ERRORS)
app.get('/', (req, res) => {
  res.json({ success: true, message: 'CRM API 100% Working! 🚀' });
});

//  FRONTEND ROUTE TESTS (No 404 errors)
app.get('/register', (req, res) => {
  res.json({ success: true, message: 'Register API Ready! POST /api/auth/register' });
});

app.get('/login', (req, res) => {
  res.json({ success: true, message: 'Login API Ready! POST /api/auth/login' });
});

app.get('/dashboard', (req, res) => {
  res.json({ success: true, message: 'Dashboard API Ready! GET /api/customers' });
});

//  REGISTER API
app.post('/api/auth/register', async (req, res) => {
  try {
    console.log(' REGISTER:', req.body.email);
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'crm-super-secret-2026',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      user: { id: user._id, name, email },
      token
    });
  } catch (error) {
    console.error('REGISTER ERROR:', error.message);
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
});

//  LOGIN API
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('🔐 LOGIN:', req.body.email);
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'crm-super-secret-2026',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      user: { id: user._id, name: user.name, email },
      token
    });
  } catch (error) {
    console.error('LOGIN ERROR:', error.message);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

// CUSTOMER ROUTES
app.get('/api/customers', authMiddleware, async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });
    res.json({ success: true, customers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/customers', authMiddleware, async (req, res) => {
  try {
    const customer = new Customer(req.body);
    await customer.save();
    res.status(201).json({ success: true, customer });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.put('/api/customers/:id', authMiddleware, async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    res.json({ success: true, customer });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.delete('/api/customers/:id', authMiddleware, async (req, res) => {
  try {
    const result = await Customer.deleteOne({ _id: req.params.id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    res.json({ success: true, message: 'Customer deleted successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

//  SERVER START
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(` CRM Server running on PORT: ${PORT}`);
  
});
