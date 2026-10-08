import User from '../models/User.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import validator from 'validator'

const createToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7h' })
}

// POST /api/auth/register
export const register = async (req, res) => {
  const { fullName, email, password } = req.body
  try {
    if (!fullName || !email || !password) {
      return res.json({ success: false, message: 'All fields are required' })
    }
    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: 'Invalid email address' })
    }
    if (password.length < 6) {
      return res.json({ success: false, message: 'Password must be at least 6 characters' })
    }

    const exists = await User.findOne({ email })
    if (exists) {
      return res.json({ success: false, message: 'Email already registered' })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const user = await User.create({ fullName, email, passwordHash })
    const token = createToken(user._id, user.role)

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      }
    })
  } catch (err) {
    res.json({ success: false, message: err.message })
  }
}

// POST /api/auth/login
export const login = async (req, res) => {
  const { email, password } = req.body
  try {
    if (!email || !password) {
      return res.json({ success: false, message: 'All fields are required' })
    }

    const user = await User.findOne({ email })
    if (!user) {
      return res.json({ success: false, message: 'User not found' })
    }

    const match = await bcrypt.compare(password, user.passwordHash)
    if (!match) {
      return res.json({ success: false, message: 'Incorrect password' })
    }

    const token = createToken(user._id, user.role)
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      }
    })
  } catch (err) {
    res.json({ success: false, message: err.message })
  }
}

// GET /api/auth/profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-passwordHash')
    if (!user) return res.json({ success: false, message: 'User not found' })
    res.json({ success: true, user })
  } catch (err) {
    res.json({ success: false, message: err.message })
  }
}