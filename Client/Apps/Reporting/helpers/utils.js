import { sortBy } from 'lodash';

const convertObjToArr = obj => {
	const clone = Object.assign({}, obj);
	const convertedArray = Object.keys(clone).map(key => {
		const newObj = clone[key];
		newObj.name = newObj.display_name;
		newObj.value = key;
		newObj.display_name;
		return newObj;
	});
	return sortBy(convertedArray, clone => clone.position);
};

const arrayUnique = array => {
	var a = array.concat();
	for (var i = 0; i < a.length; ++i) {
		for (var j = i + 1; j < a.length; ++j) {
			if (a[i] === a[j]) a.splice(j--, 1);
		}
	}

	return a;
};

export { convertObjToArr, arrayUnique };
