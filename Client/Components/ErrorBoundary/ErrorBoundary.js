import React from 'react';
import axiosInstance from '../../helpers/axiosInstance';
import CustomError from '../CustomError/index';
import '../../scss/shared/_empty.scss';
import history from '../../helpers/history';
import UserInteractionModal from './UserInteractionModal';

class ErrorBoundary extends React.Component {
	constructor(props) {
		super(props);
		this.state = { hasError: false, isModalShown: false };
	}

	static getDerivedStateFromError() {
		return { hasError: true };
	}

	sendErrorLog(type) {}

	componentDidCatch(err, info) {
		const { firstName, lastName, email, isSuperUser = false } = this.props;
		const {
			location: { pathname: routePath }
		} = history;
		console.log(err, info);
		let data = '';
		info.message = err.message;
		try {
			data = window.btoa(
				`Error: ${err ? JSON.stringify(err, null, '\n') : 'N/A'} ,  \n Info:  ${
					info ? JSON.stringify(info, null, '\n') : 'N/A'
				}`
			);
		} catch (e) {
			console.log('Data encoding failed');
			return false;
		}
		console.log(window.atob(data));
		this.setState({ errorInfo: data });
		//we will move this logic to when popup renders
		// return axiosInstance
		// 	.post('/data/createLog', {
		// 		data,
		// 		isNotifySupportMail: false,
		// 		firstName,
		// 		lastName,
		// 		email,
		// 		isSuperUser,
		// 		routePath
		// 	})
		// 	.then(() => console.log('Log Written'))
		// 	.catch(error => console.log(`Log written failed : ${error}`));
	}

	showOrHideModal = status => () => {
		this.setState({ isModalShown: status });
	};

	render() {
		const { hasError, isModalShown } = this.state;
		const { children } = this.props;
		const { showOrHideModal } = this;
		if (hasError) {
			return (
				<div style={{ textAlign: 'center' }}>
					<CustomError />
					{isModalShown ? (
						<UserInteractionModal isModalShown={isModalShown} showOrHideModal={showOrHideModal} />
					) : (
						<p style={{ marginTop: '20px', fontSize: '16px' }}>
							If you wish to report the issue, please{' '}
							<a title="AdPushup Dashboard" onClick={showOrHideModal(true)}>
								click here
							</a>
							.
						</p>
					)}
				</div>
			);
		}

		return children;
	}
}

export default ErrorBoundary;
