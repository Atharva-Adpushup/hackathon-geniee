/**
 * Created by Dhiraj on 3/3/2016.
 */
module.exports = {
	user: {
		validations: {
			isNull: [
				{ name: 'name', message: 'Please fill out name', value: '' },
				{ name: 'firstName', message: 'Please fill out first name', value: '' },
				{ name: 'email', message: 'Please fill out email id', value: '' },
				{ name: 'oldPassword', message: 'Please fill out old password', value: '' },
				{ name: 'password', message: 'Please fill out password', value: '' },
				{ name: 'confirmPassword', message: 'Please fill out confirm password', value: '' },
				{ name: 'key', message: 'Key not found', value: '' },
				{ name: 'site', message: 'Please fill out site url', value: '' },
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
			// pageviewRange will be a string
			// 'isInt': [
			// 	{ 'name': 'pageviewRange', 'message': 'Enter page view range between 1 and 10000000', 'value': { 'min': 1, 'max': 10000000 } }
			// ],
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
	api: {
		validations: {
			isNull: [
				{ name: 'siteName', message: 'Site Name cannot be blank', value: '', status: 403 },
				{ name: 'siteId', message: 'Site Id cannot be blank', value: '', status: 403 },
				{
					name: 'pageGroupName',
					message: 'Page Group Name cannot be blank',
					value: '',
					status: 403
				},
				{ name: 'pageGroupId', message: 'Page Group Id cannot be blank', value: '', status: 403 },
				{
					name: 'genieeMediaId',
					message: 'Geniee Media Id cannot be blank',
					value: '',
					status: 403
				}
			],
			isURL: [
				{
					name: 'sampleUrl',
					message: 'Please enter Sample URL in valid format - http://mywebsite.com',
					value: { require_protocol: true },
					status: 403
				},
				{
					name: 'siteDomain',
					message: 'Please enter Site Domain in valid format - http://mywebsite.com',
					value: { require_protocol: true },
					status: 403
				}
			],
			isIn: [
				{
					name: 'device',
					message: 'Please provide a valid device type. Supported values - DESKTOP, TABLET, MOBILE',
					value: '',
					status: 403,
					allowedValues: ['DESKTOP', 'TABLET', 'MOBILE']
				}
			],
			isSameDomain: [
				{
					name: 'sampleUrl',
					message: 'The Sample URL should be from your website only',
					value: '',
					status: 403
				}
			]
		}
	},
	hbAPI: {
		validations: {
			isNull: [
				/**

				 */
				{ name: 'key', message: 'Bidder Key cannot be blank', value: '', status: 403 },
				{ name: 'name', message: 'Bidder Name cannot be blank', value: '', status: 403 },
				{ name: 'relation', message: 'relation property cannot be blank', value: '', status: 403 },
				{ name: 'bids', message: 'bids property cannot be blank', value: '', status: 403 },
				{ name: 'status', message: 'status property cannot be blank', value: '', status: 403 }
			],
			isIn: [
				{
					name: 'relation',
					message: 'Please provide a valid Relation. Supported values - adpushup, direct',
					value: '',
					status: 403,
					allowedValues: ['ADPUSHUP', 'DIRECT']
				},
				{
					name: 'bids',
					message: 'Please provide Bids value. Supported values - gross, net',
					value: '',
					status: 403,
					allowedValues: ['GROSS', 'NET']
				},
				{
					name: 'status',
					message: 'Please provide status value. Supported values - active, paused',
					value: '',
					status: 403,
					allowedValues: ['ACTIVE', 'PAUSED']
				}
			],
			isBoolean: [
				{
					name: 'sizeLess',
					message: 'sizeLess property should be a boolean',
					value: '',
					status: 403
				},
				{
					name: 'reusable',
					message: 'reusable property should be a boolean',
					value: '',
					status: 403
				},
				{
					name: 'isAmpActive',
					message: 'isAmpActive property should be a boolean',
					value: '',
					status: 403
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
