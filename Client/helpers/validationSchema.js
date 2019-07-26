module.exports = {
	user: {
		validations: {
			isNull: [
				{ name: 'name', message: 'Please fill out name', value: '' },
				{ name: 'firstName', message: 'Please fill out first name', value: '' },
				{ name: 'email', message: 'Please fill out email id', value: '' },
				{ name: 'key', message: 'Key not found', value: '' },
				{ name: 'oldPassword', message: 'Please fill out old password', value: '' },
				{ name: 'password', message: 'Please fill out password', value: '' },
				{ name: 'confirmPassword', message: 'Please fill out confirm password', value: '' },
				{ name: 'site', message: 'Please fill out site url', value: '' },
				{ name: 'websiteRevenue', message: 'Please select your website revenue range', value: '' },
				{ name: 'pageviewRange', message: 'Please select a page view range', value: '' }
			],
			isLength: [
				{ name: 'name', message: 'Enter name between 1 and 150', value: { min: 1, max: 150 } },
				{
					name: 'firstName',
					message: 'Enter first name between 1 and 50',
					value: { min: 1, max: 50 }
				},
				{
					name: 'oldPassword',
					message: 'Enter old password between 6 and 50',
					value: { min: 6, max: 50 }
				},
				{
					name: 'password',
					message: 'Enter password between 6 and 50',
					value: { min: 6, max: 50 }
				},
				{
					name: 'confirmPassword',
					message: 'Enter confirm password between 6 and 50',
					value: { min: 6, max: 50 }
				}
			],
			isEmail: [{ name: 'email', message: 'Enter email in name@example.com format', value: '' }],
			isURL: [
				{ name: 'site', message: 'Enter url in valid format', value: { require_protocol: true } }
			],
			equals: [
				{
					name: 'password',
					message: 'Passwords do not match',
					value: '',
					matchAgainst: 'confirmPassword'
				}
			]
		}
	},
	hbApp: {
		validations: {
			isNull: [{ name: 'name', message: 'Please fill out name', value: '' }],
			isLength: [
				{ name: 'name', message: 'Enter name between 1 and 150', value: { min: 1, max: 150 } }
			],
			isEmail: [{ name: 'email', message: 'Enter email in name@example.com format', value: '' }],
			isURL: [
				{ name: 'site', message: 'Enter url in valid format', value: { require_protocol: true } }
			],
			equals: [
				{
					name: 'password',
					message: 'Passwords do not match',
					value: '',
					matchAgainst: 'confirmPassword'
				}
			]
		}
	},
	hbOptimization: {
		validations: {
			isNull: [{ name: 'bidder', message: 'Bidder Code cannot be blank', value: '', status: 403 }],
			isIn: [
				{
					name: 'device',
					message: 'Please provide a valid Device. Supported values - desktop, tablet, phone',
					value: '',
					status: 403,
					allowedValues: ['DESKTOP', 'TABLET', 'PHONE']
				}
			],
			isBoolean: [
				{
					name: 'status',
					message: 'status property should be a boolean',
					value: '',
					status: 403
				}
			],
			isLength: [{ name: 'country', message: 'Country Code is invalid', value: { min: 2, max: 2 } }]
		}
	}
};
