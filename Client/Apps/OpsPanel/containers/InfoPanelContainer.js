import { connect } from 'react-redux';
import InfoPanel from '../components/InfoPanel/index';
import { showNotification } from '../../../actions/uiActions';
import { updateGlobalReportMetaData } from '../../../actions/globalActions';

const mapStateToProps = (state, ownProps) => {
	const {
		reports: { global: globalReportMetaData },
		user,
		sites
	} = state.global;

	return {
		...ownProps,
		user,
		sites: sites.fetched ? sites.data : [],
		reportType: ownProps.reportType,
		globalReportMetaData
	};
};

const mapDispatchToProps = dispatch => ({
	showNotification: data => dispatch(showNotification(data)),
	updateGlobalReportMetaData: params => dispatch(updateGlobalReportMetaData(params))
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(InfoPanel);
