import { connect } from 'react-redux';
import BalanceComponent from '../Pages/Payment/Component/BalanceComponent';

const mapStateToProps = state => {
	const { email, balancePayment } = state.global.user.data;
	return { email, balancePayment };
};

export default connect(
	mapStateToProps,
	null
)(BalanceComponent);
