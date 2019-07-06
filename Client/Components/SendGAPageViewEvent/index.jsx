import React from 'react';

let prevPath;
const sendPageViewEvent = (path, isSuperUser) => {
	if (window.ga && path !== prevPath) {
		window.ga('send', {
			hitType: 'pageview',
			page: path,
			isSuperUser
		});

		prevPath = path;
	}
};

const SendGAPageViewEvent = ({ children, path, isSuperUser }) => {
	sendPageViewEvent(path, isSuperUser);
	return <React.Fragment>{children}</React.Fragment>;
};

export default SendGAPageViewEvent;
