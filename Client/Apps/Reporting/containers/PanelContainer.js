import { connect } from 'react-redux';
import { fetchReportingMeta } from '../../../actions/globalActions';
import Panel from '../components/Panel';

const mapStateToProps = (state, ownProps) => {
	const { reports, sites, user } = state.global;
	return {
		...ownProps,
		reportsMeta: reports,
		userSites: sites.fetched ? sites.data : {},
		user
	};
};

const mapDispatchToProps = dispatch => ({
	fetchReportingMeta: params => dispatch(fetchReportingMeta(params))
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Panel);
