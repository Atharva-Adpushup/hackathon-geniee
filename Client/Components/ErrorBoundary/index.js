import React from 'react';

import axiosInstance from '../../helpers/axiosInstance';
import CustomError from '../CustomError/index';
import '../../scss/shared/_empty.scss';

class ErrorBoundary extends React.Component {
	constructor(props) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError() {
		return { hasError: true };
	}

	componentDidCatch(err, info) {
		console.log(err, info);
		let data = '';

		try {
			data = window.btoa(
				`Error: ${err ? JSON.stringify(err) : 'N/A'} ------- Info:  ${
					info ? JSON.stringify(info) : 'N/A'
				}`
			);
		} catch (e) {
			console.log('Data encoding failed');
			return false;
		}

		return axiosInstance
			.post('/data/createLog', {
				data
			})
			.then(() => console.log('Log Written'))
			.catch(error => console.log(`Log written failed : ${error}`));
	}

	render() {
		const { hasError } = this.state;
		const { children } = this.props;

		if (hasError) {
			return (
				<div style={{ textAlign: 'center' }}>
					<CustomError />
					<p style={{ marginTop: '20px', fontSize: '16px' }}>
						To go back to Dashboard, please click{' '}
						<a href="/dashboard" title="AdPushup Dashboard">
							here
						</a>
						.
					</p>
				</div>
			);
		}

		return children;
	}
}

export default ErrorBoundary;
