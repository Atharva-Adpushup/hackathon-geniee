import { FormWrapper } from './commonForm';

function checkAdCode(value) {
	const response = { error: false };
	if (value.indexOf('_mNHandle') == -1 || value.indexOf('_mNDetails.loadTag') == -1) {
		return {
			...response,
			error: true,
			message: 'Only Media.net Code allowed'
		};
	}
	return response;
}

export default FormWrapper(checkAdCode, 'Media.net', /id=\"\d+\"/gi);
