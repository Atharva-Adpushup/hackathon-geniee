import React, { Component, Fragment } from 'react';
import DocumentTitle from 'react-document-title';
import { connect } from 'react-redux';
import { Nav, NavItem } from '@/Client/helpers/react-bootstrap-imports';
import { paymentsAction } from '../../actions/userActions';
import { showNotification } from '../../actions/uiActions';
import Loader from '../../Components/Loader/index';
import {
	PAYMENT_NAV_ITEMS,
	PAYMENT_NAV_ITEMS_INDEXES,
	PAYMENT_NAV_ITEMS_VALUES
} from './configs/commonConsts';
import history from '../../helpers/history';
import PaymentContainer from '../../Containers/PaymentContainer';
import MGDeals from './Component/MGDeals/MGDeals';

class Payment extends Component {
	constructor(props) {
		super(props);
		this.state = {
			redirectUrl: '',
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
			},
			paymentBalance: {
				url: '',
				width: '100%',
				height: '0px',
				isLoading: true
			},
			paymentMGDeals: {
				url: '',
				width: '100%',
				height: '0px',
				isLoading: true
			}
		};
	}

	componentDidMount() {
		const { paymentsAction: payments } = this.props;
		payments().then(res => {
			if (res.status === 200) {
				const { paymentDetails, paymentHistory } = this.state;

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
			const { paymentDetails, paymentHistory } = this.state;
			if (e.data.caller === 'PaymentDetails') {
				if (e.data.TipaltiIframeInfo.height) {
					paymentDetails.height = `${e.data.TipaltiIframeInfo.height}px`;
				}
				if (e.data.TipaltiIframeInfo.width) {
					paymentDetails.width = `${e.data.TipaltiIframeInfo.width}px`;
				}
				paymentDetails.isLoading = false;
			}
			if (e.data.caller === 'PaymentHistory') {
				if (e.data.TipaltiIframeInfo.height) {
					paymentHistory.height = `${e.data.TipaltiIframeInfo.height}px`;
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
		const { paymentDetails, paymentHistory, paymentBalance, paymentMGDeals } = this.state;
		const computedRedirectUrl = `/payment`;
		let redirectUrl = '';
		switch (value) {
			case 1:
				paymentDetails.isLoading = true;
				redirectUrl = `${computedRedirectUrl}`;
				this.setState({
					paymentDetails,
					redirectUrl
				});
				break;
			case 2:
				paymentHistory.isLoading = true;
				redirectUrl = `${computedRedirectUrl}/history`;
				this.setState({
					paymentHistory,
					redirectUrl
				});
				break;
			case 3:
				paymentBalance.isLoading = true;
				redirectUrl = `${computedRedirectUrl}/balance`;
				this.setState({
					paymentBalance,
					redirectUrl
				});
				break;
			case 4:
				paymentMGDeals.isLoading = true;
				redirectUrl = `${computedRedirectUrl}/mg-deals`;
				this.setState({
					paymentMGDeals,
					redirectUrl
				});
				break;
			default:
				break;
		}
	};

	renderIframe = data => {
		const { url, width, height, isLoading } = data;
		return (
			<div>
				{isLoading ? this.renderLoader() : ''}
				<div className="u-padding-4 text-center">
					<iframe src={url} frameBorder="0" style={{ width, height }} title="iframe" />
				</div>
			</div>
		);
	};

	renderContent = () => {
		const { paymentDetails, paymentHistory, paymentMGDeals } = this.state;
		const { activeProducts } = this.props;
		const accessDetailsTab =
			activeProducts === undefined || activeProducts.payment_details === undefined
				? true
				: activeProducts.payment_details;
		const activeTab = accessDetailsTab ? this.getActiveTab() : PAYMENT_NAV_ITEMS_INDEXES.HISTORY;
		switch (activeTab) {
			case PAYMENT_NAV_ITEMS_INDEXES.DETAILS:
				return this.renderIframe(paymentDetails);
			case PAYMENT_NAV_ITEMS_INDEXES.HISTORY:
				return this.renderIframe(paymentHistory);
			case PAYMENT_NAV_ITEMS_INDEXES.MG_DEALS:
				return <MGDeals {...this.props} />;
			case PAYMENT_NAV_ITEMS_INDEXES.BALANCE:
				return <PaymentContainer {...this.props} />;
			default:
				return null;
		}
	};

	getActiveTab = () => {
		const {
			customProps: { activeTab }
		} = this.props;
		return activeTab;
	};

	render() {
		const { balancePayment, activeProducts, isSuperUser, sites } = this.props;
		const { redirectUrl } = this.state;
		const accessDetailsTab =
			activeProducts === undefined || activeProducts.payment_details === undefined
				? true
				: activeProducts.payment_details;
		const activeTab = accessDetailsTab ? this.getActiveTab() : PAYMENT_NAV_ITEMS_INDEXES.HISTORY;
		const activeItem = PAYMENT_NAV_ITEMS[activeTab];
		if (redirectUrl) {
			history.push(redirectUrl);
			return null;
		}
		return (
			<>
				<DocumentTitle title="Payment" />
				<div title="Payment Settings">
					<Nav bsStyle="tabs" activeKey={activeItem.INDEX} onSelect={this.handleNavSelect}>
						{/* this tab can be disabled for specific sites. Enabled by  default , disble by setting "payment_details" flag false in  "activeProducts", maintained in user doc */}
						{accessDetailsTab && <NavItem eventKey={1}>{PAYMENT_NAV_ITEMS_VALUES.DETAILS}</NavItem>}
						<NavItem eventKey={2}>{PAYMENT_NAV_ITEMS_VALUES.HISTORY}</NavItem>
						{/* only show this tab for specific sites. Enabled using "accessBalanceTab" flag, maintained in user doc */}
						{balancePayment && balancePayment.accessBalanceTab ? (
							<NavItem eventKey={3}>{PAYMENT_NAV_ITEMS_VALUES.BALANCE}</NavItem>
						) : null}
						{isSuperUser && <NavItem eventKey={4}>{PAYMENT_NAV_ITEMS_VALUES.MG_DEALS}</NavItem>}
					</Nav>
					{this.renderContent()}
				</div>
			</>
		);
	}
}

const mapStateToProps = state => {
	const { balancePayment, activeProducts, isSuperUser, email, sites } = state.global.user.data;
	const accountAccessData = state.global.findUsers.data;
	return { balancePayment, activeProducts, isSuperUser, sites, email, accountAccessData };
};

// 	mapDispatchToProps = (dispatch, ownProps) => ({
// 		showNotification: params => dispatch(showNotification(params))
// 	});

export default connect(mapStateToProps, { paymentsAction, showNotification })(Payment);
