/* eslint-disable prefer-destructuring */
/* eslint-disable no-console */
/* eslint-disable no-alert */
/* eslint-disable no-restricted-syntax */
import clipboard from 'clipboard-polyfill';
import Entities from 'html-entities';
import sortBy from 'lodash/sortBy';
import history from './history';
import { supportedAdSizes } from '../constants/visualEditor';
import { DEMO_ACCOUNT_DATA } from '../constants/others';

const { XmlEntities } = Entities;
const entities = new XmlEntities();

function errorHandler(err, userMessage = 'Operation Failed') {
	const { response = false } = err;
	let message;
	let code = 400;

	if (response) {
		const axiosDataObject = response ? response.data : false;
		const { data } = axiosDataObject || { data: false };
		message = data ? data.message : 'No message found in API error response';
		code = data ? data.code : code;
	} else {
		message = err.message;
	}

	console.log(message);
	if (code === 400) {
		return window.alert(userMessage);
	}
	return history.push('/error');
}

function makeFirstLetterCapitalize(word) {
	return word.charAt(0).toUpperCase() + word.slice(1).replace(/([A-Z])/g, ' $1');
}

function copyToClipBoard(content, message = 'Successfully Copied') {
	const toAlert = typeof message === 'string' ? message : 'Successfully Copied';

	clipboard.writeText(content);
	window.alert(toAlert);
}

function formatDate(date, operation, value = 0) {
	const toFormat = new Date(date);

	if (toFormat === 'Invalid Date') {
		throw new Error('Invalid Date provided to format');
	}

	let day;
	switch (operation) {
		case 'add':
			day = String(toFormat.getDate() + value);
			break;
		case 'subtract':
			day = String(toFormat.getDate() - value);
			break;
		default:
			day = String(toFormat.getDate());
	}

	const month = String(toFormat.getMonth() + 1);
	const year = String(toFormat.getFullYear());

	return `${day.length === 1 ? '0' : ''}${day}-${month.length === 1 ? '0' : ''}${month}-${year}`;
}

const getDuplicatesInArray = array =>
	array.reduce(
		(accumulator, value) => {
			const isValueInObject = !!(
				Object.prototype.hasOwnProperty.call(accumulator.object, value) && accumulator.object[value]
			);
			const isValueInArray = !!accumulator.duplicates.includes(value);

			if (!isValueInObject) {
				accumulator.object[value] = value;
			} else if (isValueInObject && !isValueInArray) {
				accumulator.duplicates.push(value);
			}

			return accumulator;
		},
		{ duplicates: [], object: {} }
	);

const getTruthyArray = array => array.filter(value => !!value);

const isItemInArray = (item, array) => array.indexOf(item) > -1;

const rightTrim = (string, s) => (string ? string.replace(new RegExp(`${s}*$`), '') : '');

const domanize = domain =>
	domain
		? rightTrim(
				domain
					.replace('http://', '')
					.replace('https://', '')
					.replace('www.', ''),
				'/'
		  )
		: '';

const getHtmlEncodedJSON = config => {
	const encodedData = {};

	if (!config) {
		return encodedData;
	}

	for (const property in config) {
		if (Object.prototype.hasOwnProperty.call(config, property)) {
			const value = config[property];
			const isStringValue = !!(value && typeof value === 'string');

			let encodedValue;

			if (isStringValue) {
				encodedValue = entities.encode(value);
				encodedData[property] = encodedValue;
			}
		}
	}

	return encodedData;
};

const getSupportedAdSizes = () => {
	const allAdSizes = supportedAdSizes.concat([]);
	const adSizes = [];

	allAdSizes.forEach(layout => {
		layout.sizes.forEach(size => {
			const isSizeInResultArray = adSizes.find(
				adSize => adSize.width === size.width && adSize.height === size.height
			);

			if (!isSizeInResultArray) {
				adSizes.push({
					width: size.width,
					height: size.height
				});
			}
		});
	});

	return sortBy(adSizes, size => size.width);
};

const getPageGroupHash = (pageGroup, platform) => {
	const name = `${pageGroup}_${platform}`;
	const object = { pageGroups: [name] };

	return window.btoa(window.encodeURIComponent(JSON.stringify(object)));
};

const getValidObject = object => !!(object && Object.keys(object).length);

const checkDemoUserEmail = email => {
	const { EMAIL } = DEMO_ACCOUNT_DATA;
	const isValid = !!(email && EMAIL && email === EMAIL);

	return isValid;
};

const getDemoUserSites = (reportData, email) => {
	const inputReportData = Object.assign({}, reportData);
	const isDemoUser = checkDemoUserEmail(email);
	const isValidReportData = !!(
		getValidObject(inputReportData) && getValidObject(inputReportData.site)
	);
	const isValidDemoUser = !!(isDemoUser && isValidReportData);
	const {
		DEFAULT_SITE: { NAME }
	} = DEMO_ACCOUNT_DATA;
	const dummySiteName = NAME;

	if (!isValidDemoUser) {
		return inputReportData;
	}

	Object.keys(inputReportData.site).forEach(siteId => {
		const siteObject = inputReportData.site[siteId];

		siteObject.siteName = dummySiteName;
		inputReportData.site[siteId] = siteObject;
	});

	return inputReportData;
};

const getDashboardDemoUserSiteIds = (siteIdValue, email) => {
	const { SITES, DEFAULT_SITE } = DEMO_ACCOUNT_DATA;
	const isValidSiteId = !!siteIdValue;
	const isMultipleSites = !!(siteIdValue.split(',').length > 1);
	const isDemoUserEmail = checkDemoUserEmail(email);
	const isSiteIdAll = !!(isValidSiteId && (siteIdValue.toString() === 'all' || isMultipleSites));
	const isDemoUserWithAllSites = isDemoUserEmail && isSiteIdAll;
	const isDemoUserWithSingleSite = isDemoUserEmail && !isSiteIdAll;
	let computedSiteIds = siteIdValue;

	if (isDemoUserWithAllSites) {
		computedSiteIds = Object.keys(SITES).join(',');
	} else if (isDemoUserWithSingleSite) {
		computedSiteIds = DEFAULT_SITE.SITE_ID;
	}

	return computedSiteIds;
};

const getReportingDemoUserValidation = (email, reportType) => {
	const isReportType = !!reportType;
	const isReportTypeGlobal = !!(isReportType && reportType === 'global');
	const isReportTypeAccount = !!(isReportType && reportType === 'account');
	const isReportTypeSite = !!(isReportType && reportType === 'site');
	const isDemoUserEmail = checkDemoUserEmail(email);
	const isWithGlobalSites = isDemoUserEmail && isReportTypeGlobal;
	const isWithAllSites = isDemoUserEmail && isReportTypeAccount;
	const isWithSingleSite = isDemoUserEmail && isReportTypeSite;
	const isValid = isWithGlobalSites || isWithAllSites || isWithSingleSite;
	const resultObject = { isValid, isWithGlobalSites, isWithAllSites, isWithSingleSite };

	return resultObject;
};

const getReportingDemoUserSiteIds = (siteIdValue, email, reportType) => {
	const { isWithGlobalSites, isWithAllSites, isWithSingleSite } = getReportingDemoUserValidation(email, reportType);
	const { SITES, DEFAULT_SITE } = DEMO_ACCOUNT_DATA;
	let computedSiteIds = siteIdValue;

	if (isWithGlobalSites || isWithAllSites) {
		computedSiteIds = Object.keys(SITES).join(',');
	} else if (isWithSingleSite) {
		computedSiteIds = DEFAULT_SITE.SITE_ID;
	}

	return computedSiteIds;
};

const getReportingControlDemoUserSites = (responseData, path, isDemoUser) => {
	const inputResponseData = Object.assign({}, responseData);
	const inputReportData = Object.assign({}, inputResponseData.data);
	const isValidReportData = !!(
		getValidObject(inputReportData) &&
		inputReportData.result &&
		inputReportData.columns
	);
	const isSitesPath = path.match(/GET_ALL_SITES/);
	const isPageGroupPath = path.match(/GET_ALL_PAGE_GROUPS/);
	const isValidDemoUser = !!(isDemoUser && isValidReportData && (isSitesPath || isPageGroupPath));
	const {
		DEFAULT_SITE: { NAME, SITE_ID }
	} = DEMO_ACCOUNT_DATA;
	const dummySiteName = NAME;
	const dummySiteId = SITE_ID;
	const resultData = [];

	if (!isValidDemoUser) {
		inputResponseData.data = inputReportData;
		return inputResponseData;
	}

	if (isSitesPath) {
		resultData.push({
			value: dummySiteName,
			id: dummySiteId
		});
	} else if (isPageGroupPath) {
		inputReportData.result.forEach(itemObject => {
			const inputItemObject = Object.assign({}, itemObject);

			if (isPageGroupPath) {
				const pageGroupSplitArr = inputItemObject.value.split('-');
				const computedPageGroupName = `${dummySiteName}-${pageGroupSplitArr[1]}`;

				inputItemObject.value = computedPageGroupName;
			}

			resultData.push(inputItemObject);
		});
	}

	inputReportData.result = resultData;
	inputResponseData.data = inputReportData;
	return inputResponseData;
};

const getAppBaseUrls = () => {
	const { origin, host } = window.location;
	const resultObject = {
		default: origin,
		http: `http://${host}`
	};

	return resultObject;
};

const getOnboardingTemplateData = site => {
	const isValidSite = !!(site && Object.keys(site).length);
	const linkUrl = isValidSite ? `/onboarding?siteId=${site.siteId}` : '/onboarding';
	const buttonText = isValidSite ? `Continue with ${site.domain}` : 'Complete site onboarding';
	const resultObject = { linkUrl, buttonText };

	return resultObject;
};

export {
	errorHandler,
	getDuplicatesInArray,
	getTruthyArray,
	isItemInArray,
	domanize,
	makeFirstLetterCapitalize,
	copyToClipBoard,
	formatDate,
	getHtmlEncodedJSON,
	getSupportedAdSizes,
	getPageGroupHash,
	checkDemoUserEmail,
	getDashboardDemoUserSiteIds,
	getReportingDemoUserValidation,
	getReportingDemoUserSiteIds,
	getDemoUserSites,
	getReportingControlDemoUserSites,
	getAppBaseUrls,
	getOnboardingTemplateData
};
