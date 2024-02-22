const docs = require('@googleapis/docs');

const config = require('../configs/config');

const getGoogleDocInstance = async () => {
	const credentials = JSON.parse(Buffer.from(config.googleDocCreds, 'base64').toString());
	const auth = new docs.auth.GoogleAuth({
		credentials,
		scopes: ['https://www.googleapis.com/auth/documents']
	});
	const authClient = await auth.getClient();

	return docs.docs({
		version: 'v1',
		auth: authClient
	});
};
const handleElements = element => {
	if (element.textRun && element.textRun.content) {
		return element.textRun.content;
	}
	return '';
};
const handleParagraphs = paragraph => {
	if (paragraph.paragraph && paragraph.paragraph.elements) {
		return paragraph.paragraph.elements.map(handleElements).join('');
	}
	return '';
};
const getDocumentDataAsTextValues = googleDocResponse => {
	const { data: { body: { content } = {} } = {} } = googleDocResponse;
	const documentData = content.map(handleParagraphs).join('');
	return documentData;
};
const getGoogleDoc = async documentId => {
	const googleDocInstance = await getGoogleDocInstance();
	return googleDocInstance.documents.get({
		documentId
	});
};

module.exports = { getGoogleDoc, getDocumentDataAsTextValues };
