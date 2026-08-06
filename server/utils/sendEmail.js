const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

const sendEmail = async (email, otp) => {
    
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Verify your email",
        text: `Your OTP is ${otp}. It will expire in 3 minutes.`
    });

};

module.exports = sendEmail;