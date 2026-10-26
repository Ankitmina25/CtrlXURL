const { sendContactEmail } = require('../utils/sendEmail');

const sendContactMessage = async (req, res) => {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    try {
        await sendContactEmail({
            name: name.trim(),
            email: email.trim(),
            subject: subject.trim(),
            message: message.trim()
        });

        return res.status(200).json({ message: 'Message sent successfully' });
    } catch (error) {
        console.error('Contact email delivery failed:', error.message);
        return res.status(500).json({ message: 'Unable to send message right now' });
    }
};

module.exports = { sendContactMessage };
