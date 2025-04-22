import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

// Cấu hình transporter
const transporter = nodemailer.createTransport({
    service: 'gmail', // Hoặc SMTP provider khác
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
})

// Kiểm tra kết nối
transporter.verify((error: any) => {
    if (error) {
        console.error('Email service error:', error)
    } else {
        console.log('Email service is ready to send messages')
    }
})

export default transporter
