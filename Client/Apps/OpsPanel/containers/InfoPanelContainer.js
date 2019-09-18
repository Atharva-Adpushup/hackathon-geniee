import { connect } from 'react-redux';
import InfoPanel from '../components/InfoPanel/index';
import { showNotification } from '../../../actions/uiActions';
import { fetchReportingMeta } from '../../../actions/globalActions';

const mapStateToProps = (state, ownProps) => {
	const {
		reports: {
			data: { site = {}, widget, metrics },
			fetched: isReportsMetaFetched
		},
		user,
		sites
	} = state.global;

	return {
		...ownProps,
		widget,
		metrics,
		user,
		isReportsMetaFetched,
		sites: sites.fetched ? sites.data : [],
		reportingSites: site,
		reportType: ownProps.reportType || 'global'
	};
};

const mapDispatchToProps = dispatch => ({
	showNotification: data => dispatch(showNotification(data)),
	setReportingMetaData: params => dispatch(fetchReportingMeta(params))
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(InfoPanel);
