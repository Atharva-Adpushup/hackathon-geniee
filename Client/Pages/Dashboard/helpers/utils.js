const convertObjToArr = obj => {
	return Object.keys(obj).map(key => {
		let newObj = obj[key];
		console.log(newObj.display_name);
		newObj.name = newObj.display_name;
		newObj.value = key;
		delete newObj.display_name;
		return newObj;
	});
};

export { convertObjToArr };
