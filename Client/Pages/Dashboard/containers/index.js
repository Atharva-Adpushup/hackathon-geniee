import { connect } from 'react-redux';
import Dashboard from '../components/index';
import { showNotification } from '../../../actions/uiActions';
import { fetchReportingMeta } from '../../../actions/globalActions';

const mapStateToProps = (state, ownProps) => {
	const { reports, user, sites } = state.global;
	return {
		...ownProps,
		reportsMeta: reports,
		// widget: reportingData.widget || {},
		user,
		// reportingSites: reportingData.site || {},
		sites: sites.fetched ? sites.data : {},
		reportType: ownProps.reportType || 'account'
	};
};

const mapDispatchToProps = dispatch => ({
	showNotification: data => dispatch(showNotification(data)),
	fetchReportingMeta: params => dispatch(fetchReportingMeta(params))
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Dashboard);
