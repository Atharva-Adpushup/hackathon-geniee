import { connect } from 'react-redux';
import ErrorBoundary from './ErrorBoundary';

const mapStateToProps = state => {
	const {
		global: { user: { data: { email, firstName, lastName, isSuperUser } = {} } = {} }
	} = state;

	return {
		email,
		firstName,
		lastName,
		isSuperUser
	};
};

export default connect(mapStateToProps)(ErrorBoundary);
