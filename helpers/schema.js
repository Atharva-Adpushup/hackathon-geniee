/**
 * Created by Dhiraj on 3/3/2016.
 */
module.exports = {
	user: {
		'validations': {
			'isNull': [
				{ 'name': 'name', 'message': 'Please fill out name', 'value': '' },
				{ 'name': 'firstName', 'message': 'Please fill out first name', 'value': '' },
				{ 'name': 'email', 'message': 'Please fill out email id', 'value': '' },
				{ 'name': 'oldPassword', 'message': 'Please fill out old password', 'value': '' },
				{ 'name': 'password', 'message': 'Please fill out password', 'value': '' },
				{ 'name': 'confirmPassword', 'message': 'Please fill out confirm password', 'value': '' },
				{ 'name': 'site', 'message': 'Please fill out site url', 'value': '' },
				{ 'name': 'pageviewRange', 'message': 'Please select a page view range', 'value': '' }
			],
			'isLength': [
				{ 'name': 'name', 'message': 'Enter name between 1 and 150', 'value': { 'min': 1, 'max': 150 } },
				{ 'name': 'firstName', 'message': 'Enter first name between 1 and 50', 'value': { 'min': 1, 'max': 50 } },
				{ 'name': 'oldPassword', 'message': 'Enter old password between 6 and 32', 'value': { 'min': 6, 'max': 32 } },
				{ 'name': 'password', 'message': 'Enter password between 6 and 32', 'value': { 'min': 6, 'max': 32 } },
				{ 'name': 'confirmPassword', 'message': 'Enter confirm password between 6 and 32', 'value': { 'min': 6, 'max': 32 } }
			],
			// pageviewRange will be a string
			// 'isInt': [
			// 	{ 'name': 'pageviewRange', 'message': 'Enter page view range between 1 and 10000000', 'value': { 'min': 1, 'max': 10000000 } }
			// ],
			'isEmail': [
				{ 'name': 'email', 'message': 'Enter email in name@example.com format', 'value': '' }
			],
			'isURL': [
				{ 'name': 'site', 'message': 'Enter url in valid format', 'value': { 'require_protocol': true } }
			],
			'equals': [
				{ 'name': 'password', 'message': 'Passwords do not match', value: '', matchAgainst: 'confirmPassword' }
			]
		}
	}
};

