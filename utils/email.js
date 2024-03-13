const nodemailer = require('nodemailer');
const { user, pass } = require('../config')
const htmlTemplate = require('../templates/mailTemplate')
const logger = require('./pino')


async function sendEmail(options) {
    const htmlTemp = await htmlTemplate(options)
    console.log(user, pass);
    try {
        // Create a SMTP transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail', // true for 465, false for other ports
            auth: {
                user: user,
                pass: pass,
            },
        });

        const info = await transporter.sendMail({
            from: `${user}`,
            to: options.email,
            subject: 'OTP VERIFICATION',
            html: htmlTemp,
        });

        logger.info('Email sent successfully:', info.messageId);
        return { success: true, message: 'Email sent Successfully' };
    } catch (err) {
        logger.error('Error sending email:', err);
        return { success: false, error: 'An error occurred while sending the email' };
    }
}

module.exports = sendEmail;
