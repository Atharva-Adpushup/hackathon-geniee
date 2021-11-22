import cloneDeep from 'lodash/cloneDeep';

function isObject(val) {
	return typeof val === 'object' && val !== null && !(val instanceof Array);
}

export default function removeHBEmptyParams(params) {
	const paramsCopy = cloneDeep(params);

	const cleanedParams = Object.keys(paramsCopy).reduce((result, key) => {
		if (!paramsCopy[key]) {
			return result;
		}
		if (isObject(paramsCopy[key])) {
			// this will handle params with value as Object.
			// NaN case is also being handled by above condition
			paramsCopy[key] = removeHBEmptyParams(paramsCopy[key]);
		}

		return { ...result, [key]: paramsCopy[key] };
	}, {});

	return cleanedParams;
}
