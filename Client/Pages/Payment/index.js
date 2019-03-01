import React, { Component } from 'react';
import ActionCard from '../../Components/ActionCard/index';
import { paymentsAction } from '../../actions/userActions';
import { connect } from 'react-redux';
class Payment extends Component {
	state = {
		tipaltiUrl: '',
		width: '100%',
		height: '0px'
	};
	componentDidMount() {
		const { paymentsAction: payments } = this.props;
		payments().then(res => {
			if (res.status == 200) {
				this.setState({
					tipaltiUrl: res.data.tipaltiUrl
				});
			}
		});
		window.addEventListener('message', this.handleFrameTasks);
	}
	componentWillUnmount() {
		window.removeEventListener('message', this.handleFrameTasks);
	}
	handleFrameTasks = e => {
		if (e && e.data && e.data.TipaltiIframeInfo && e.data.caller == 'PaymentDetails') {
			if (e.data.TipaltiIframeInfo.height) {
				this.setState({ height: e.data.TipaltiIframeInfo.height + 'px' });
			}
			if (e.data.TipaltiIframeInfo.width) {
				this.setState({ width: e.data.TipaltiIframeInfo.width + 'px' });
			}
		}
	};

	render() {
		const { tipaltiUrl, width, height } = this.state;
		return (
			<ActionCard title="Payment Settings">
				<div className="u-padding-4 text-center">
					<iframe
						id="tipaltiPaymentDetailIframe"
						src={tipaltiUrl}
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
)(Payment);
