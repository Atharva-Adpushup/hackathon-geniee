const woodlot = require('woodlot').customLogger;
const Mailer = require('../../helpers/Mailer');
const config = require('../../configs/config').email;
const mailContentLogger = new woodlot({
	streams: ['./logs/mailContent-Queue.log'],
	stdout: false
});

function sendMail(dataObject) {
	const { header, content, emailId } = dataObject,
		isDataExists = !!(header && content && emailId);

	if (!isDataExists) {
		mailContentLogger.info('No mail from nack queue as data is wrong');
		return {
			success: false,
			message: 'No mail from nack queue as data is wrong'
		};
	}

	const mailConfig = {
			MAIL_FROM: config.MAIL_FROM,
			MAIL_FROM_NAME: config.MAIL_FROM_NAME,
			SMTP_SERVER: config.SMTP_SERVER,
			SMTP_USERNAME: config.SMTP_USERNAME,
			SMTP_PASSWORD: config.SMTP_PASSWORD
		},
		mailer = new Mailer(mailConfig, 'html'),
		mailDataConfig = { to: emailId, subject: header, html: content };

	return mailer.send(mailDataConfig).then(() => {
		return {
			success: true,
			message: 'Mail Sent'
		};
	});
}

module.exports = sendMail;
