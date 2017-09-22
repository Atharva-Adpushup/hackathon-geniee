import React from 'react';
import CommonConsts from './config';
import _ from 'lodash';

const getSupportedAdSizes = () => {
		const allAdSizes = CommonConsts.supportedAdSizes;
		let adSizes = [];

		_.forEach(allAdSizes, layout => {
			_.forEach(layout.sizes, size => {
				if (
					!_.find(adSizes, adSize => {
						return adSize.width === size.width && adSize.height === size.height;
					})
				) {
					adSizes.push({
						width: size.width,
						height: size.height
					});
				}
			});
		});

		return _.sortBy(adSizes, size => size.width);
	},
	cloneElement = (el, props, children) => React.cloneElement(el, props, children),
	createElement = (type, props, children) => React.createElement(type, props, children),
	getActivePartners = () => {
		const config = CommonConsts.hbConfig;
		let hbConfig = [];

		for (var key in config) {
			if (config[key].isHb) {
				hbConfig.push(config[key]);
			}
		}

		return hbConfig;
	},
	generateOptionInputs = (options, onChangeHandler, selectedPartnerOptions) => {
		if (!options) {
			return;
		}

		let partnerOption = Object.assign({}, options);

		if (selectedPartnerOptions) {
			for (let option in partnerOption) {
				partnerOption[option].value = selectedPartnerOptions[option];
			}
		} else {
			for (let option in partnerOption) {
				partnerOption[option].value = undefined;
			}
		}

		let inputElems = [];

		for (let i in partnerOption) {
			const option = partnerOption[i],
				input = React.createElement('input', {
					placeholder: `Please enter ${option.alias}`,
					onChange: onChangeHandler,
					name: i,
					defaultValue: option.value,
					required: option.validations.required ? true : undefined
				});
			inputElems.push(input);
		}

		return inputElems;
	},
	cleanHbConfigData = hbConfig => {
		const activePartners = getActivePartners().length;
		let data = {};

		_.forEach(hbConfig, sizeData => {
			const size = Object.keys(sizeData)[0],
				sizeOptions = sizeData[size];
			data[size] = [];

			let optionsGroup = [];

			for (let i = 0; i < sizeOptions.length; i += activePartners) {
				for (let j = 0; j < activePartners; j++) {
					const option = sizeOptions[i + j];

					if (option !== undefined) {
						const partnerName = Object.keys(option)[0];

						const partnerOptions = Object.assign({}, option[partnerName]);
						delete partnerOptions['optionsIndex'];
						optionsGroup.push({
							bidder: partnerName,
							params: partnerOptions
						});
					}
				}
			}

			data[size].push(optionsGroup);
		});

		return data;
	},
	arrayJumpSlice = (arr, n, fn) => {
		for (var i = 0; i < arr.length; i += n) fn(arr.slice(i, i + n));
	},
	getSizeWiseSetupGroups = hbConfig => {
		const partners = getActivePartners().length;

		let data = {};

		for (let size in hbConfig) {
			data[size] = [];

			arrayJumpSlice(hbConfig[size][0], partners, optionsGroup => {
				data[size].push(optionsGroup);
			});
		}

		return data;
	},
	removeOptionsIndex = hbConfig => {
		for (let size in hbConfig) {
			const sizeSetups = hbConfig[size];
			sizeSetups.forEach(sizeSetup => {
				sizeSetup.forEach(sizeOptions => {
					delete sizeOptions.params['optionsIndex'];
				});
			});
		}

		return hbConfig;
	},
	loadHbConfigToPanel = hbConfig => {
		let data = [];

		for (let size in hbConfig) {
			const sizeSetups = hbConfig[size];

			let partnerOptions = [];

			sizeSetups.forEach(sizeSetup => {
				sizeSetup.forEach(sizeOptions => {
					const bidder = sizeOptions.bidder,
						option = { [bidder]: sizeOptions.params };

					partnerOptions.push(option);
				});
			});

			data.push({ [size]: partnerOptions });
		}

		data.forEach(sizeData => {
			for (let size in sizeData) {
				const sizeDataOptions = sizeData[size];

				for (let i = 0; i < sizeDataOptions.length; i++) {
					for (let partner in sizeDataOptions[i]) {
						sizeDataOptions[i][partner].optionsIndex = i;
					}
				}
			}
		});

		return data;
	};

export {
	getSupportedAdSizes,
	cloneElement,
	createElement,
	getActivePartners,
	generateOptionInputs,
	cleanHbConfigData,
	arrayJumpSlice,
	getSizeWiseSetupGroups,
	loadHbConfigToPanel,
	removeOptionsIndex
};
