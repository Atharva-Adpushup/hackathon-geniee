import { FormWrapper } from './commonForm';

function checkAdCode(value) {
	const response = { error: false };
	if (
		value.indexOf('//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js') === -1 ||
		value.indexOf('data-ad-client') === -1 ||
		value.indexOf('data-ad-slot') === -1
	) {
		return {
			...response,
			error: true,
			message: 'Only ADX Code allowed'
		};
	}
	return response;
}

export default FormWrapper(checkAdCode, 'ADX', /([A-Z])\w+/g);
