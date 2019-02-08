import clipboard from 'clipboard-polyfill';

const deferred = $.Deferred();

function makeFirstLetterCapitalize(word) {
	return word.charAt(0).toUpperCase() + word.slice(1).replace(/([A-Z])/g, ' $1');
}

function copyToClipBoard(content) {
	clipboard.writeText(content);
	alert('Successfully Copied');
}
function getData(url, data) {
	return $.get(url, data);
}
function getInitData() {
	return getData('/tagManager/networkConfig').then(networkConfig => {
		deferred.resolve({ global: { networkConfig } });
		return deferred.promise();
	});
}

export { makeFirstLetterCapitalize, copyToClipBoard, getInitData };
