const getRandomString = len => {
	len = len && Number(len) && len > 1 ? len : 10;

	return window.Math.random()
		.toString(32)
		.substr(2, len);
};

const getCompiledTemplate = (template, parameterCollection) => {
	let finalTemplate = '';

	parameterCollection.forEach(itemObject => {
		const isFinalTemplate = !!finalTemplate;
		const computedTemplate = isFinalTemplate ? finalTemplate : template;

		finalTemplate = computedTemplate.replace(itemObject.replacee, itemObject.replacer);
	});

	return finalTemplate;
};

const getEncodedData = inputCode => window.btoa(inputCode);

module.exports = { getRandomString, getEncodedData, getCompiledTemplate };
