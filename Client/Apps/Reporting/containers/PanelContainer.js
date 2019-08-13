import { connect } from 'react-redux';
import { fetchReportingMeta } from '../../../actions/globalActions';
import Panel from '../components/Panel';

const mapStateToProps = (state, ownProps) => {
	const { reports, sites } = state.global;
	return {
		...ownProps,
		reportsMeta: reports,
		userSites: sites.fetched ? sites.data : {}
	};
};

const mapDispatchToProps = dispatch => ({
	fetchReportingMeta: params => dispatch(fetchReportingMeta(params))
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Panel);
