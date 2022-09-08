import { connect } from 'react-redux';
import ReportsPanel from '../components/index';

const mapStateToProps = state => {
	const {
		sites,
		reports: {
			global: { reportingDelayPopup }
		},
		user: {
			data: { sites: userSitesInfo }
		}
	} = state.global;
	return {
		userSites: sites.fetched ? sites.data : {},
		userSitesInfo,
		reportingDelayPopup
	};
};
const mapDispatchToProps = () => {
	const computedObject = {};

	return computedObject;
};

export default connect(mapStateToProps, mapDispatchToProps)(ReportsPanel);
