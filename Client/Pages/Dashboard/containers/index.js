import { connect } from 'react-redux';
import Dashboard from '../components/index';
import { showNotification } from '../../../actions/uiActions';

const mapStateToProps = (state, ownProps) => {
	const {
		reports: {
			data: {
				site,
				dashboard: { widget }
			}
		},
		user
	} = state.global;
	return {
		...ownProps,
		widget,
		user,
		site
	};
};

const mapDispatchToProps = dispatch => ({
	showNotification: data => dispatch(showNotification(data))
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Dashboard);
