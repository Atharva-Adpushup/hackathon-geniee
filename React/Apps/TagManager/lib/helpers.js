import clipboard from 'clipboard-polyfill';

function makeFirstLetterCapitalize(word) {
	return word.charAt(0).toUpperCase() + word.slice(1).replace(/([A-Z])/g, ' $1');
}

function copyToClipBoard(content) {
	clipboard.writeText(content);
	alert('Copied Successful');
}

export { makeFirstLetterCapitalize, copyToClipBoard };
