function errorHandler(err, userMessage = 'Operation Failed') {
	const { response = false } = err;
	let message;

	if (response) {
		const axiosDataObject = response ? response.data : false;
		const { data } = axiosDataObject || { data: false };
		message = data ? data.message : 'No message found in API error response';
	} else {
		message = err.message;
	}

	console.log(message);
	return window.alert(userMessage);
}

export { errorHandler };
