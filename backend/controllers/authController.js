const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const jwt = require('jsonwebtoken');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });
};

// @desc    Get List of Faculty for Login Dropdown
// @route   GET /api/auth/faculty-list
// @access  Public
const getFacultyLoginList = asyncHandler(async (req, res) => {
    // Return minimal info needed for selection
    // Populate userId to get the email (which is the actual login identifier)
    const faculty = await Faculty.find({})
        .select('firstName lastName department designation userId')
        .populate('userId', 'email role isActive');
        
    // Filter out inactive users if necessary, though good to show them with error maybe? 
    // Let's filter to only active ones to be cleaner.
    const activeFaculty = faculty.filter(f => f.userId && f.userId.isActive);

    const list = activeFaculty.map(f => ({
        id: f._id,
        name: `${f.firstName} ${f.lastName}`,
        department: f.department,
        email: f.userId.email // Crucial for the login process
    }));

    res.json(list);
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  let { identifier, password } = req.body; 

  // Sanitize Input
  identifier = identifier.trim().toLowerCase();

  // Try finding user by email first
  let user = await User.findOne({ email: identifier });

  // If not found by email, try finding Student by enrollment and then getting linked user
  if (!user) {
    const student = await Student.findOne({ 
        enrollmentNumber: { $regex: new RegExp(`^${identifier}$`, 'i') } 
    });
    if (student && student.userId) {
        user = await User.findById(student.userId);
    }
  }

  if (user && (await user.matchPassword(password))) {
    if (!user.isActive) {
      res.status(401);
      throw new Error('Account is inactive. Contact Admin.');
    }

    // Fetch Name
    let name = user.email; // Default
    if (user.role === 'student') {
        const s = await Student.findOne({ userId: user._id });
        if(s) name = `${s.firstName} ${s.lastName}`;
    } else if (user.role === 'faculty' || user.role === 'mentor' || user.role === 'hod') {
        const f = await Faculty.findOne({ userId: user._id });
        if(f) name = `${f.firstName} ${f.lastName}`;
    }

    res.json({
      token: generateToken(user._id, user.role),
      user: {
        _id: user._id,
        email: user.email,
        name: name, // Added Name
        role: user.role,
      },
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Register a new user (Admin only/Dev seeding)
// @route   POST /api/auth/register
// @access  Public (for dev setup)
const registerUser = asyncHandler(async (req, res) => {
  const { email, password, role } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  // Password hashing is handled in User model pre-save middleware
  const user = await User.create({
    email,
    passwordHash: password, 
    role,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});



// @desc    Get Current User Profile
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user) {
        let name = user.email;
        if (user.role === 'student') {
            const s = await Student.findOne({ userId: user._id });
            if(s) name = `${s.firstName} ${s.lastName}`;
        } else if (user.role === 'faculty' || user.role === 'mentor' || user.role === 'hod') {
            const f = await Faculty.findOne({ userId: user._id });
            if(f) name = `${f.firstName} ${f.lastName}`;
        }

        res.json({
            _id: user._id,
            email: user.email,
            name: name,
            role: user.role
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

module.exports = { loginUser, registerUser, getFacultyLoginList, getMe };
