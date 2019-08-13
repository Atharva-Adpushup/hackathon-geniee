import { connect } from 'react-redux';
import InfoPanel from '../components/InfoPanel/index';
import { showNotification } from '../../../actions/uiActions';

const mapStateToProps = (state, ownProps) => {
	const {
		reports: {
			data: { site = {}, widget, metrics, filter }
		},
		user,
		sites
	} = state.global;

	return {
		...ownProps,
		widget,
		user,
		metrics,
		filter,
		reportingSites: site,
		sites: sites.fetched ? sites.data : [],
		reportType: ownProps.reportType || 'global'
	};
};

const mapDispatchToProps = dispatch => ({
	showNotification: data => dispatch(showNotification(data))
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(InfoPanel);
