// server.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const multer = require('multer');
const AWS = require('aws-sdk');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/stylesync', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// MongoDB Models
const User = mongoose.model('User', {
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const ClothingItem = mongoose.model('ClothingItem', {
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String },
  category: { type: String },
  color: { type: String },
  pattern: { type: String },
  season: { type: String },
  imageUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const Outfit = mongoose.model('Outfit', {
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String },
  items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ClothingItem' }],
  occasion: { type: String },
  season: { type: String },
  isFavorite: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

// AWS S3 Configuration
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
});

// Multer setup for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Forbidden' });
    req.user = user;
    next();
  });
};

// Routes
app.post('/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user
    const newUser = new User({
      email,
      password: hashedPassword,
      name: name || email.split('@')[0],
    });
    
    await newUser.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser._id,
        email: newUser.email,
        name: newUser.name,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/upload-clothing', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const file = req.file;
    const { name, category, color, pattern, season } = req.body;
    
    // Upload to S3
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `${req.user.userId}/clothing/${Date.now()}-${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read',
    };
    
    const s3Upload = await s3.upload(params).promise();
    
    // Create clothing item in database
    const clothingItem = new ClothingItem({
      userId: req.user.userId,
      name: name || 'Untitled',
      category: category || 'Other',
      color: color || '',
      pattern: pattern || '',
      season: season || '',
      imageUrl: s3Upload.Location,
    });
    
    await clothingItem.save();
    
    res.status(201).json({
      success: true,
      item: clothingItem,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/wardrobe', authenticateToken, async (req, res) => {
  try {
    const clothingItems = await ClothingItem.find({ userId: req.user.userId })
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      items: clothingItems,
    });
  } catch (error) {
    console.error('Wardrobe fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/recommendations', authenticateToken, async (req, res) => {
  try {
    // Get user's wardrobe
    const clothingItems = await ClothingItem.find({ userId: req.user.userId });
    
    if (clothingItems.length < 3) {
      return res.status(200).json({
        success: true,
        recommendations: [],
        message: 'Add more items to your wardrobe to get recommendations',
      });
    }
    
    // Get weather data (you would integrate with a weather API here)
    const weather = {
      temperature: 75, // example
      condition: 'sunny', // example
    };
    
    // Generate outfit recommendations based on weather and available items
    // This is a placeholder - you would implement your recommendation algorithm here
    const outfits = [
      {
        name: 'Casual Day Out',
        items: clothingItems.filter(item => item.category === 'Casual').slice(0, 3),
        occasion: 'casual',
        season: 'summer',
      },
      {
        name: 'Office Ready',
        items: clothingItems.filter(item => item.category === 'Business').slice(0, 3),
        occasion: 'work',
        season: 'all',
      },
    ];
    
    res.status(200).json({
      success: true,
      recommendations: outfits,
    });
  } catch (error) {
    console.error('Recommendations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
