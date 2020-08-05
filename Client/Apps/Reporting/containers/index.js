import { connect } from 'react-redux';
import ReportsPanel from '../components/index';

const mapStateToProps = state => {
	const { sites } = state.global;

	return {
		userSites: sites.fetched ? sites.data : {}
	};
};

const mapDispatchToProps = () => {
	const computedObject = {};

	return computedObject;
};

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(ReportsPanel);
