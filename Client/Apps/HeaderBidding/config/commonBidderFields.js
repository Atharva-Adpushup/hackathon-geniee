/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */

/**
 * Return Common Bidder Fields
 *
 * @export
 * @param {boolean} isApRelation
 * @param {object} manageBidderData
 * @returns
 */
export default function getCommonBidderFields(isApRelation, isSuperUser, manageBidderData, isS2S) {
	let commonBidderFields = {
		relation: {
			name: 'Relation',
			dataType: 'string',
			inputType: 'selectBox',
			options: isApRelation
				? [
						{
							name: 'AdPushup',
							value: 'adpushup',
							isDisabled: !isSuperUser,
							toolTipMessage: null,
							toolTipDisabled: true
						},
						{ name: 'Direct', value: 'direct' }
				  ]
				: [{ name: 'Direct', value: 'direct' }],
			defaultValue: isApRelation && isSuperUser ? 'adpushup' : 'direct',
			isRequired: true,
			isEditable: true
		},
		bids: {
			name: 'Bids',
			dataType: 'string',
			inputType: 'selectBox',
			options: [{ name: 'Net', value: 'net' }, { name: 'Gross', value: 'gross' }],
			isRequired: true,
			isEditable: true
		},
		revenueShare: {
			name: 'Revenue Share',
			dataType: 'number',
			inputType: 'text',
			isRequired: false,
			isEditable: true
		},
		isAmpActive: {
			name: 'AMP Status',
			dataType: 'string',
			inputType: 'selectBox',
			options: [{ name: 'Active', value: 'true' }, { name: 'Inactive', value: 'false' }],
			isRequired: isS2S,
			isEditable: isS2S,
			defaultValue: 'false'
		},
		isS2SActive: {
			name: 'S2S Web Status',
			dataType: 'string',
			inputType: 'selectBox',
			options: [{ name: 'Active', value: 'true' }, { name: 'Inactive', value: 'false' }],
			isRequired: isS2S,
			isEditable: isS2S,
			defaultValue: 'false'
		}
	};

	if (manageBidderData) {
		const { values, newFields } = manageBidderData;

		// Populate existing fields values
		if (values && Object.keys(values).length === Object.keys(commonBidderFields).length) {
			for (const key in values) {
				if (!commonBidderFields[key]) return false;

				const value = values[key];
				commonBidderFields[key].value = value;
			}
		}

		// Add new fields
		if (typeof newFields.isPaused === 'boolean') {
			commonBidderFields = {
				status: {
					name: 'Partner Status',
					dataType: 'string',
					inputType: 'selectBox',
					options: [{ name: 'Active', value: 'active' }, { name: 'Paused', value: 'paused' }],
					isRequired: true,
					isEditable: true
				},
				...commonBidderFields
			};
		}
	}

	return commonBidderFields;
}
