import { connect } from 'react-redux';
import Sites from '../components/Settings/Sites';
import { showNotification } from '../../../actions/uiActions';
import { saveSettings } from '../../../actions/siteActions';

const mapStateToProps = (state, ownProps) => {
	const { sites } = state.global;
	return {
		fetched: sites.fetched,
		sites: sites.data,
		...ownProps
	};
};

const mapDispatchToProps = dispatch => ({
	showNotification: data => dispatch(showNotification(data)),
	saveSettings: (siteId, data) => dispatch(saveSettings(siteId, data))
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Sites);