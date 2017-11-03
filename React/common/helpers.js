import $ from 'jquery';

const capitalCase = str => {
		return str
			.toLowerCase()
			.split(' ')
			.map(word => word[0].toUpperCase() + word.substr(1))
			.join(' ');
	},
	ajax = params => {
		const { method, url, data } = params;

		return new Promise((resolve, resject) => {
			$.ajax({
				method,
				url,
				headers: { 'Content-Type': 'application/json' },
				data,
				contentType: 'json',
				dataType: 'json',
				success: res => {
					return resolve(res);
				},
				fail: res => {
					return reject(res);
				}
			});
		});
	};

export { capitalCase, ajax };
