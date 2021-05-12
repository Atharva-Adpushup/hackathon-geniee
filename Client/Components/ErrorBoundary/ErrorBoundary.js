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

	showOrHideModal = status => () => {
		this.setState({ isModalShown: status });
	};

	sendErrorLog = (type, userInput) => {
		const { firstName, lastName, email, isSuperUser = false } = this.props;
		const {
			location: { pathname: routePath }
		} = history;
		const { err, info, errorMessage = '' } = this.state;
		return axiosInstance
			.post('/data/createLog', {
				err,
				info,
				isNotifySupportMail: false,
				firstName,
				lastName,
				email,
				isSuperUser,
				routePath,
				type,
				userInput,
				errorMessage
			})
			.then(() => console.log('Log Written'))
			.catch(error => console.log(`Log written failed : ${error}`));
	};

	componentDidCatch(err, info) {
		console.log(err, info);
		return this.setState({ err: err, info: info, errorMessage: err.message }, () =>
			this.sendErrorLog('default')
		);
	}

	render() {
		const { hasError, isModalShown } = this.state;
		const { children } = this.props;
		const { showOrHideModal, sendErrorLog } = this;
		if (hasError) {
			return (
				<div style={{ textAlign: 'center' }}>
					<CustomError />
					{isModalShown ? (
						<UserInteractionModal
							isModalShown={isModalShown}
							showOrHideModal={showOrHideModal}
							sendErrorLog={sendErrorLog}
						/>
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
