import { connect } from 'react-redux';

import { showNotification } from '../../../actions/uiActions';
import SiteMapping from '../components/SiteMapping/index';

const mapStateToProps = (state, ownProps) => ({
	...ownProps
});

const mapDispatchToProps = dispatch => ({
	showNotification: data => dispatch(showNotification(data))
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(SiteMapping);
