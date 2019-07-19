import $ from 'jquery';
import React from 'react';
import Config from './config';
import forEach from 'lodash/forEach';
import find from 'lodash/find';
import sortBy from 'lodash/sortBy';

const capitalCase = str =>
		str
			.toLowerCase()
			.split(' ')
			.map(word => word[0].toUpperCase() + word.substr(1))
			.join(' '),
	isFloat = num => num % 1 !== 0,
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
				success: res => resolve(res),
				fail: res => reject(res)
			});
		});
	};

const getSupportedAdSizes = () => {
	const { supportedAdSizes: allAdSizes } = Config;
	let adSizes = [];

	forEach(allAdSizes, layout => {
		forEach(layout.sizes, size => {
			if (
				!find(adSizes, adSize => {
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

	return sortBy(adSizes, size => size.width);
};

export { capitalCase, isFloat, ajax, getSupportedAdSizes };
