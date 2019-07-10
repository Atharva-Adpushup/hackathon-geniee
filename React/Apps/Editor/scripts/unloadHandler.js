const unloadHandler = e => {
	const dialogStr = 'Changes made might not saved.';

	e.returnValue = dialogStr;
	return dialogStr;
};

export default unloadHandler;
