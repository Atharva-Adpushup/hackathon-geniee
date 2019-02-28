import React, { Component, Fragment } from 'react';
import ActionCard from '../../Components/ActionCard/index';
import { paymentsAction } from '../../actions/userActions';
import { connect } from 'react-redux';
class PaymentHistory extends Component {
	state = {
		paymentHistoryUrl: '',
		width: '100%',
		height: '0px'
	};
	componentDidMount() {
		const { paymentsAction: payments } = this.props;
		payments().then(res => {
			if (res.status == 200) {
				this.setState({
					paymentHistoryUrl: res.data.paymentHistoryUrl
				});
			}
		});
		window.addEventListener('message', this.handleFrameTasks);
	}
	componentWillUnmount() {
		window.removeEventListener('message', this.handleFrameTasks);
	}
	handleFrameTasks = e => {
		if (e && e.data && e.data.TipaltiIframeInfo && e.data.caller == 'PaymentHistory') {
			if (e.data.TipaltiIframeInfo.height) {
				this.setState({ height: e.data.TipaltiIframeInfo.height + 'px' });
			}
			if (e.data.TipaltiIframeInfo.width) {
				this.setState({ width: e.data.TipaltiIframeInfo.width + 'px' });
			}
		}
	};

	render() {
		const { paymentHistoryUrl, width, height } = this.state;
		return (
			<ActionCard title="Payment History">
				<div style={{ padding: '20px', textAlign: 'center' }}>
					<iframe
						id="tipaltiPaymentHistoryIframe"
						src={paymentHistoryUrl}
						frameBorder="0"
						style={{ width: width, height: height }}
					/>
				</div>
			</ActionCard>
		);
	}
}

export default connect(
	null,
	{ paymentsAction }
)(PaymentHistory);
