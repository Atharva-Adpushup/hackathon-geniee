import { connect } from 'react-redux';
import SiteSettings from '../components/index';
import { updateApConfig } from '../../../actions/siteActions';

const mapStateToProps = (state, ownProps) => {
	const {
		sites: { data }
	} = state.global;

	return {
		sites: data,
		...ownProps
	};
};

const mapDispatchToProps = dispatch => ({
	updateApConfig: (siteId, apConfigs) => dispatch(updateApConfig(siteId, apConfigs))
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(SiteSettings);
