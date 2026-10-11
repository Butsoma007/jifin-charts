import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

// ✅ Configure Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSWORD,  // App password, NOT Gmail password
  },
})

export const sendResetEmail = async (email, resetToken, resetUrl) => {
  try {
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <h2>Password Reset Request</h2>
        <p>You requested a password reset for your Jifin Charts account.</p>
        <p>Click the link below to reset your password (valid for 1 hour):</p>
        <a href="${resetUrl}" style="background-color: #095DE9; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Reset Password
        </a>
        <p>Or copy this code: <strong>${resetToken}</strong></p>
        <p>If you didn't request this, ignore this email.</p>
      `,
    }

    await transporter.sendMail(mailOptions)
    return true
  } catch (error) {
    console.error('Email send error:', error.message)
    return false
  }
}

export default transporter