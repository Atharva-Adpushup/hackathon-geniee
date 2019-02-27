import { connect } from 'react-redux';
import ManageSite from '../Pages/ManageSite/components/index';
import { fetchAppStatuses } from '../actions/siteActions';

const mapStateToProps = (state, ownProps) => {
	const { sites } = state.global;
	const { match } = ownProps;
	const siteId = match.params ? match.params.siteId : false;
	const site = siteId && sites.data[siteId] ? sites.data[siteId] : false;
	return {
		site,
		...ownProps
	};
};

const mapDispatchToProps = dispatch => ({
	fetchAppStatuses: siteId => dispatch(fetchAppStatuses(siteId))
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(ManageSite);
