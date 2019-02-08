import React from 'react';

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
		// log the error to an error reporting service
	}

	render() {
		const { hasError } = this.state;
		const { children } = this.props;

		if (hasError) {
			return <h1>Something went wrong.</h1>;
		}

		return children;
	}
}

export default ErrorBoundary;
