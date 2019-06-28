import { connect } from 'react-redux';

import { showNotification } from '../../../actions/uiActions';
import Tools from '../components/Tools/index';

const mapStateToProps = (state, ownProps) => {
	const { sites } = state.global;
	return {
		fetched: sites.fetched,
		sites: sites.data,
		...ownProps
	};
};

const mapDispatchToProps = dispatch => ({
	showNotification: data => dispatch(showNotification(data))
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Tools);
