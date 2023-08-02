const {
	DEAL_CREATION_ACTIONS,
	MG_DEAL_EMAIL_SUBJECT,
	MG_MAIL_BODY_TEMPLATE,
	MAIL_HTML_STYLE
} = require('../configs/commonConsts');

const { CREATE_DEAL_SUBJECT, DELETE_DEAL_SUBJECT, EDIT_DEAL_SUBJECT } = MG_DEAL_EMAIL_SUBJECT;
const { CREATE_DEAL, DELETE_DEAL, EDIT_DEAL } = MG_MAIL_BODY_TEMPLATE;
const { bodyStyles, headerStyles, tableStyles } = MAIL_HTML_STYLE;
const generateTableHtmlStringForEmail = data => {
	const keys = [
		...data.reduce((all, obj) => {
			Object.keys(obj).forEach(key => all.add(key));
			return all;
		}, new Set())
	];

	const header = keys.map(key => `<th>${key}</th>`).join('');
	const tbody = data
		.map(row => keys.map(key => `<td style="${bodyStyles.cellStyle}">${row[key]}</td>`).join(''))
		.map(row => `<tr>${row}</tr>`);
	const tbodyMail = tbody.join(' ');

	return `
		<table style="${tableStyles}">
            <thead style="${headerStyles.theadStyle}"><tr>${header}</tr></thead>
            <tbody style="${bodyStyles.tbodyStyle}">${tbodyMail}</body>
        </table>`;
};

function getBody(content, mailContent) {
	const { email, originalEmail, siteId, dealValueData } = mailContent;
	const newMailContent = content
		.replace('__EMAIL__', email)
		.replace('__ORIGINAL_EMAIL__', originalEmail)
		.replace('__SITE_ID__', siteId)
		.replace('__DEAL_VALUES__', dealValueData);
	return newMailContent;
}

const getEmailContent = ({ type, email, dealValues, originalEmail, siteId }) => {
	const dealValueData = generateTableHtmlStringForEmail(dealValues);
	let subject;
	let body;

	switch (type) {
		case DEAL_CREATION_ACTIONS.CREATE_MGDEAL:
			subject = CREATE_DEAL_SUBJECT;
			body = originalEmail
				? getBody(CREATE_DEAL.isSuperUser, { email, dealValueData, originalEmail, siteId })
				: getBody(CREATE_DEAL.isUser, { email, dealValueData, originalEmail, siteId });
			break;
		case DEAL_CREATION_ACTIONS.EDIT_MGDEAL:
			subject = EDIT_DEAL_SUBJECT;
			body = originalEmail
				? getBody(EDIT_DEAL.isSuperUser, { email, dealValueData, originalEmail, siteId })
				: getBody(EDIT_DEAL.isUser, { email, dealValueData, originalEmail, siteId });
			break;
		case DEAL_CREATION_ACTIONS.DELETE_MGDEAL:
			subject = DELETE_DEAL_SUBJECT;
			body = originalEmail
				? getBody(DELETE_DEAL.isSuperUser, { email, dealValueData, originalEmail, siteId })
				: getBody(DELETE_DEAL.isUser, { email, dealValueData, originalEmail, siteId });
			break;
		default:
			break;
	}
	return { body, subject };
};

module.exports = {
	getEmailContent
};
