const mailService = require('../mailService/index'),
	fs = require('fs');

fs.readFile(`${__dirname}/templates/dummy.html`, (err, fileString) => {
	if (err) {
		throw err;
	}

	mailService({
		header: `Email Report testing`,
		content: `${fileString}`,
		emailId: 'amdsouza92@gmail.com'
	});
});
