import { connect } from 'react-redux';
import Dashboard from '../components/index';
import { showNotification } from '../../../actions/uiActions';

const mapStateToProps = (state, ownProps) => {
	const {
		reports: {
			data: { site, widget }
		},
		user,
		sites
	} = state.global;
	return {
		...ownProps,
		widget,
		user,
		reportingSites: site,
		sites: sites.fetched ? sites.data : [],
		reportType: 'account'
	};
};

const mapDispatchToProps = dispatch => ({
	showNotification: data => dispatch(showNotification(data))
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Dashboard);
