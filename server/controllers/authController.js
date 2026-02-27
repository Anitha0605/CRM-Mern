const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // ✅ Hash password HERE (not in middleware)
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const user = await User.create({ 
      name, 
      email, 
      password: hashedPassword 
    });
    
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    
    res.status(201).json({
      success: true,
      user: { id: user._id, name, email },
      token
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: 'User already exists' 
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }
    
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    
    res.json({
      success: true,
      user: { id: user._id, name: user.name, email },
      token
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};