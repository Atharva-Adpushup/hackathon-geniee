import { FormWrapper } from './commonForm';

function checkAdCode(value) {
	const response = { error: false };
	if (
		value.indexOf('pagead2.googlesyndication.com') == -1 ||
		value.indexOf('"adsbygoogle"') == -1 ||
		value.indexOf('data-ad-slot') == -1 ||
		value.indexOf('data-ad-client') == -1
	) {
		return {
			...response,
			error: true,
			message: 'Only Adsense Code allowed'
		};
	}
	return response;
}

export default FormWrapper(checkAdCode, 'Adsense', /data-ad-slot=\"\d+\"/gi);
