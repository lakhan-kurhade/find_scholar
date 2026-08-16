const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// =========================
// SIGNUP
// =========================
router.post('/signup', async (req, res) => {
  try {
    const {
  name,
  email,
  password,
  educationLevel,
  course,
  fieldOfStudy,
  state,
  category,
  gender,
  annualIncome,
} = req.body;

    // Check required fields
    if (
      !name ||
      !email ||
      !password ||
      !educationLevel ||
      !course ||
      !fieldOfStudy ||
      !state ||
      !category ||
!gender ||
!annualIncome
    ) {
      return res.status(400).json({
        message: 'Please provide all required fields.',
      });
    }

    // Check whether email already exists
    const existingUser = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (existingUser) {
      return res.status(409).json({
        message: 'An account with this email already exists.',
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      educationLevel,
      course: course.trim(),
      fieldOfStudy: fieldOfStudy.trim(),
      state: state.trim(),
      category: category.trim(),
gender,
annualIncome: annualIncome.trim(),
    });

    // Create token
    const token = jwt.sign(
      {
        userId: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '7d',
      }
    );

    res.status(201).json({
      message: 'Account created successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        educationLevel: user.educationLevel,
        course: user.course,
        fieldOfStudy: user.fieldOfStudy,
        state: user.state,
        category: user.category,
gender: user.gender,
annualIncome: user.annualIncome,
        profileCompleted: user.profileCompleted,
      },
    });
  } catch (error) {
  console.error('Signup error:', error);

  res.status(500).json({
    message: 'Signup failed',
    error: error.message,
  });
}
});

// =========================
// LOGIN
// =========================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required.',
      });
    }

    // Find user
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password.',
      });
    }

    // Check password
    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: 'Invalid email or password.',
      });
    }

    // Create token
    const token = jwt.sign(
      {
        userId: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '7d',
      }
    );

    res.json({
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        educationLevel: user.educationLevel,
        course: user.course,
        fieldOfStudy: user.fieldOfStudy,
        state: user.state,
        category: user.category,
gender: user.gender,
annualIncome: user.annualIncome,
        profileCompleted: user.profileCompleted,
      },
    });
  } catch (error) {
    console.error('Login error:', error);

    res.status(500).json({
      message: 'Server error while logging in.',
    });
  }
});

// =========================
// GET CURRENT USER
// =========================
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');

    if (!user) {
      return res.status(404).json({
        message: 'User not found.',
      });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        educationLevel: user.educationLevel,
        course: user.course,
        fieldOfStudy: user.fieldOfStudy,
        state: user.state,
        category: user.category,
        gender: user.gender,
        annualIncome: user.annualIncome,
        profileCompleted: user.profileCompleted,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);

    res.status(500).json({
      message: 'Failed to fetch profile.',
    });
  }
});

// =========================
// UPDATE PROFILE
// =========================
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const {
      name,
      educationLevel,
      course,
      fieldOfStudy,
      state,
      category,
      gender,
      annualIncome,
    } = req.body;

    if (
      !name ||
      !educationLevel ||
      !course ||
      !fieldOfStudy ||
      !state ||
      !category ||
      !gender ||
      !annualIncome
    ) {
      return res.status(400).json({
        message: 'Please provide all required profile fields.',
      });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        name: name.trim(),
        educationLevel,
        course: course.trim(),
        fieldOfStudy: fieldOfStudy.trim(),
        state: state.trim(),
        category: category.trim(),
        gender,
        annualIncome: annualIncome.trim(),
        profileCompleted: true,
      },
      {
        new: true,
        runValidators: true,
      }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        message: 'User not found.',
      });
    }

    res.json({
      message: 'Profile updated successfully.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        educationLevel: user.educationLevel,
        course: user.course,
        fieldOfStudy: user.fieldOfStudy,
        state: user.state,
        category: user.category,
        gender: user.gender,
        annualIncome: user.annualIncome,
        profileCompleted: user.profileCompleted,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);

    res.status(500).json({
      message: 'Failed to update profile.',
    });
  }
});

module.exports = router;
