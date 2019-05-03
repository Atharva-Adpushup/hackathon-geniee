const convertObjToArr = obj => {
	return Object.keys(obj).map(key => {
		let newObj = obj[key];
		newObj.name = newObj.display_name;
		newObj.value = key;
		delete newObj.display_name;
		return newObj;
	});
};

export { convertObjToArr };
