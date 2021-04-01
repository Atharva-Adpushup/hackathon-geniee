import cloneDeep from 'lodash/cloneDeep';

export default function removeHBEmptyParams(params) {
	const paramsCopy = cloneDeep(params);

	const cleanedParams = Object.keys(paramsCopy).reduce((result, key) => {
		if (!paramsCopy[key]) {
			return result;
		}
		return { ...result, [key]: paramsCopy[key] };
	}, {});

	return cleanedParams;
}
