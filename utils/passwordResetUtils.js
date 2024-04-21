const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Generate a random token
const generateToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

// Generate a reset token and associate it with the user
const generateResetToken = (user) => {
    const token = generateToken();
    user.resetToken = token;
    user.resetTokenExpires = Date.now() + 3600000; // Token expires in 1 hour (adjust as needed)
    user.save();
    return token;
};

// Send a password reset email to the user
const sendPasswordResetEmail = async (user, resetToken) => {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
            user: 'mateenbashirm@gmail.com',
            pass: 'xvlcyysovqjdljul',
        },
        tls: {
            rejectUnauthorized: false // Ignore TLS errors
        }
    });

    const mailOptions = {
        from: 'mateenbashirm@gmail.com',
        to: user.email,
        subject: 'Password Reset Request',
        html: `<p>You have requested to reset your password. Click <a href="http://localhost:4000/reset-password?token=${resetToken}">here</a> to reset your password.</p>`
    };

    await transporter.sendMail(mailOptions);
};

module.exports = { generateResetToken, sendPasswordResetEmail };
