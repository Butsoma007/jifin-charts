import User from '../models/User.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import validator from 'validator'
import crypto from 'crypto'
import { sendResetEmail } from '../config/mailer.js'

const createToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '1d' })
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
// POST /api/auth/forgot-password
export const forgotPassword = async (req, res) => {
  const { email } = req.body
  try {
    if (!email) {
      return res.json({ success: false, message: 'Email is required' })
    }

    const user = await User.findOne({ email })
    if (!user) {
      return res.json({ success: false, message: 'User not found' })
    }

    // ✅ Generate reset token (valid for 1 hour)
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000)  // 1 hour

    // Save to user
    user.resetToken = resetToken
    user.resetTokenExpiry = resetTokenExpiry
    await user.save()

    // ✅ Create reset link
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`

    // ✅ Send email
    const emailSent = await sendResetEmail(email, resetToken, resetUrl)
    if (!emailSent) {
      return res.json({ success: false, message: 'Failed to send reset email' })
    }

    res.json({ 
      success: true, 
      message: 'Password reset email sent. Check your inbox.' 
    })
  } catch (err) {
    res.json({ success: false, message: err.message })
  }
}

// POST /api/auth/verify-reset-token
export const verifyResetToken = async (req, res) => {
  const { token } = req.body
  try {
    if (!token) {
      return res.json({ success: false, message: 'Token is required' })
    }

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() }  // Token not expired
    })

    if (!user) {
      return res.json({ success: false, message: 'Invalid or expired reset token' })
    }

    res.json({ success: true, message: 'Token is valid', email: user.email })
  } catch (err) {
    res.json({ success: false, message: err.message })
  }
}

// POST /api/auth/reset-password
export const resetPassword = async (req, res) => {
  const { token, newPassword, confirmPassword } = req.body
  try {
    if (!token || !newPassword || !confirmPassword) {
      return res.json({ success: false, message: 'All fields are required' })
    }

    if (newPassword !== confirmPassword) {
      return res.json({ success: false, message: 'Passwords do not match' })
    }

    if (newPassword.length < 6) {
      return res.json({ success: false, message: 'Password must be at least 6 characters' })
    }

    // ✅ Find user with valid reset token
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() }
    })

    if (!user) {
      return res.json({ success: false, message: 'Invalid or expired reset token' })
    }

    // ✅ Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10)

    // ✅ Update password and clear reset fields
    user.passwordHash = passwordHash
    user.resetToken = null
    user.resetTokenExpiry = null
    await user.save()

    res.json({ success: true, message: 'Password reset successfully. Please login with your new password.' })
  } catch (err) {
    res.json({ success: false, message: err.message })
  }
}