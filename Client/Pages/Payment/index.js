import React, { Component } from 'react';
import ActionCard from '../../Components/ActionCard/index';
import { paymentsAction } from '../../actions/userActions';
import { showNotification } from '../../actions/uiActions';
import Loader from '../../Components/Loader/index';
import { Nav, NavItem, Alert } from 'react-bootstrap';
import { connect } from 'react-redux';
class Payment extends Component {
	state = {
		activeNav: 1,
		isBillingProfileComplete: false,
		paymentDetails: {
			url: '',
			width: '100%',
			height: '0px',
			isLoading: true
		},
		paymentHistory: {
			url: '',
			width: '100%',
			height: '0px',
			isLoading: true
		}
	};
	componentDidMount() {
		const { paymentsAction: payments } = this.props;
		payments().then(res => {
			if (res.status == 200) {
				let { paymentDetails, paymentHistory } = this.state;

				paymentDetails.url = res.data.tipaltiUrls.tipaltiUrl;
				paymentHistory.url = res.data.tipaltiUrls.paymentHistoryUrl;
				this.setState({
					paymentDetails,
					paymentHistory
				});
			}
		});
		window.addEventListener('message', this.handleFrameTasks);
	}
	componentWillUnmount() {
		window.removeEventListener('message', this.handleFrameTasks);
	}
	handleFrameTasks = e => {
		if (e && e.data && e.data.TipaltiIframeInfo) {
			let { paymentDetails, paymentHistory } = this.state;
			if (e.data.caller == 'PaymentDetails') {
				if (e.data.TipaltiIframeInfo.height) {
					paymentDetails.height = e.data.TipaltiIframeInfo.height + 'px';
				}
				if (e.data.TipaltiIframeInfo.width) {
					paymentDetails.width = e.data.TipaltiIframeInfo.width + 'px';
				}
				paymentDetails.isLoading = false;
			}
			if (e.data.caller == 'PaymentHistory') {
				if (e.data.TipaltiIframeInfo.height) {
					paymentHistory.height = e.data.TipaltiIframeInfo.height + 'px';
				}
				paymentHistory.isLoading = false;
			}
			this.setState({
				paymentDetails,
				paymentHistory
			});
		}
	};
	renderLoader = () => (
		<div style={{ position: 'relative', width: '100%', height: '100%' }}>
			<Loader />
		</div>
	);
	handleNavSelect = value => {
		let { paymentDetails, paymentHistory } = this.state;
		switch (value) {
			default:
			case 1:
				paymentDetails.isLoading = true;
				this.setState({
					paymentDetails,
					activeNav: value
				});
			case 2:
				paymentHistory.isLoading = true;
				this.setState({
					paymentHistory,
					activeNav: value
				});
		}
	};

	renderIframe = data => {
		let { url, width, height, isLoading } = data;
		return (
			<div>
				{isLoading ? this.renderLoader() : ''}
				<div className="u-padding-4 text-center">
					<iframe src={url} frameBorder="0" style={{ width: width, height: height }} />
				</div>
			</div>
		);
	};

	renderContent = () => {
		const { activeNav, paymentDetails, paymentHistory } = this.state;
		switch (activeNav) {
			default:
			case 1:
				return this.renderIframe(paymentDetails);
			case 2:
				return this.renderIframe(paymentHistory);
		}
	};

	render() {
		const { activeNav } = this.state;
		return (
			<ActionCard title="Payment Settings">
				<Nav bsStyle="tabs" activeKey={activeNav} onSelect={this.handleNavSelect}>
					<NavItem eventKey={1}>Payment Details</NavItem>
					<NavItem eventKey={2}>Payment History</NavItem>
				</Nav>
				{this.renderContent()}
			</ActionCard>
		);
	}
}

// const mapStateToProps = (state, ownProps) => ({
// 		...ownProps
// 	}),
// 	mapDispatchToProps = (dispatch, ownProps) => ({
// 		showNotification: params => dispatch(showNotification(params))
// 	});

export default connect(
	null,
	{ paymentsAction, showNotification }
)(Payment);
