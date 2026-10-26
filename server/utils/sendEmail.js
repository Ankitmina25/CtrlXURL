const nodemailer = require("nodemailer");

const getTransporter = () => {
    return nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: (process.env.EMAIL_USER || "").trim(),
            pass: (process.env.EMAIL_PASSWORD || "").replace(/\s+/g, "")
        }
    });
};

const sendEmail = async (email, otp) => {
    console.log(`\n==============================================`);
    console.log(`🔑 [OTP CODE] For: ${email} | Code: ${otp}`);
    console.log(`==============================================\n`);

    const transporter = getTransporter();
    await transporter.sendMail({
        from: (process.env.EMAIL_USER || "").trim(),
        to: email,
        subject: "Verify your email",
        text: `Your OTP is ${otp}. It will expire in 3 minutes.`
    });
};

const sendContactEmail = async ({ name, email, subject, message }) => {
    const transporter = getTransporter();
    await transporter.sendMail({
        from: (process.env.EMAIL_USER || "").trim(),
        to: (process.env.EMAIL_USER || "").trim(),
        replyTo: email,
        subject: `Contact form: ${subject}`,
        text: `Name: ${name}\nEmail: ${email}\n\n${message}`
    });
};

module.exports = sendEmail;
module.exports.sendContactEmail = sendContactEmail;