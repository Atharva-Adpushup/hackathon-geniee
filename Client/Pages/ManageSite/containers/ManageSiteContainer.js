import { connect } from 'react-redux';
import ManageSite from '../components/index';

const mapStateToProps = (state, ownProps) => {
	const {
		user: { data },
		sites
	} = state.global;
	return {
		user: data,
		userSites: { ...sites.data },
		...ownProps
	};
};

const mapDispatchToProps = () => ({});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(ManageSite);
