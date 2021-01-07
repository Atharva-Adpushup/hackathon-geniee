import { connect } from 'react-redux';
import ReportsPanel from '../components/index';

const mapStateToProps = state => {
	const {
		sites,
		user: {
			data: { sites: userSitesInfo }
		}
	} = state.global;

	return {
		userSites: sites.fetched ? sites.data : {},
		userSitesInfo
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
