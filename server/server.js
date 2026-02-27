require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const dotenv = require('dotenv');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

//  MongoDB Atlas (Render)
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log(' MongoDB Connected'))
  .catch(err => console.log(' MongoDB Error:', err));

// SCHEMAS
const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String
});
const User = mongoose.model('User', UserSchema);

const CustomerSchema = new mongoose.Schema({
  name: String, 
  email: String, 
  phone: String, 
  company: String, 
  address: String
});
const Customer = mongoose.model('Customer', CustomerSchema);

// AUTH MIDDLEWARE
const authMiddleware = (req, res, next) => {
  const token = req.header('authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ success: false, message: 'No token' });
  
  jwt.verify(token, process.env.JWT_SECRET || 'crm-secret-key', (err, decoded) => {
    if (err) return res.status(401).json({ success: false, message: 'Invalid token' });
    req.user = decoded;
    next();
  });
};

//  ALL ROUTES
app.post('/api/auth/register', async (req, res) => {
  console.log(' REGISTER:', req.body.email);
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'crm-secret-key');
    res.json({ success: true, user: { id: user._id, name, email }, token });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  console.log(' LOGIN:', req.body.email);
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'crm-secret-key');
    res.json({ success: true, user: { id: user._id, name: user.name, email }, token });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/customers', authMiddleware, async (req, res) => {
  console.log(' GET customers');
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });
    res.json({ success: true, customers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/customers', authMiddleware, async (req, res) => {
  console.log(' ADD:', req.body.name);
  try {
    const customer = new Customer(req.body);
    await customer.save();
    res.status(201).json({ success: true, customer });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.put('/api/customers/:id', authMiddleware, async (req, res) => {
  console.log(' UPDATE:', req.params.id);
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!customer) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, customer });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.delete('/api/customers/:id', authMiddleware, async (req, res) => {
  console.log(' DELETE:', req.params.id);
  try {
    const result = await Customer.deleteOne({ _id: req.params.id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    res.json({ success: true, message: 'Customer deleted successfully!' });
  } catch (error) {
    console.error('DELETE ERROR:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});


app.get('/', (req, res) => res.json({ success: true, message: 'CRM API 100% Working!' }));

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/index.html'));
  });
}

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/dist/index.html'));
  });
}


//  PORT
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` Server running on PORT: ${PORT}`);
});