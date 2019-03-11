import React, { Component, Fragment } from 'react';
import { Helmet } from 'react-helmet';
import Promise from 'bluebird';
import { FormControl, Alert, Table, Button, Modal, Nav, NavItem } from 'react-bootstrap';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import ActionCard from '../../Components/ActionCard/index';
import proxyService from '../../services/proxyService';
import { showNotification } from '../../actions/uiActions';
import Loader from '../../Components/Loader/index';
import { ADSTXT_SITE_LIST_HEADERS, ADSTXT_STATUS } from '../../constants/others';
import CustomButton from '../../Components/CustomButton';
import { copyToClipBoard } from '../../Apps/ApTag/lib/helpers';
import SendCodeByEmailModal from '../../Components/SendCodeByEmailModal';
import {
	ADSTXT_NAV_ITEMS,
	ADSTXT_NAV_ITEMS_INDEXES,
	ADSTXT_NAV_ITEMS_VALUES
} from './configs/commonConsts';

class AdsTxtManager extends Component {
	state = {
		adsTxtSnippet: '',
		sites: [],
		isLoading: true,
		showModal: false,
		modalAdsTxt: '',
		showSendCodeByEmailModal: false,
		redirectUrl: ''
	};

	componentDidMount() {
		Promise.all([proxyService.getAdsTxt(), this.getSitesAdstxtStatus()])
			.spread((res, sites) => {
				let adsTxtSnippet = '';
				if ((res.status = 200)) adsTxtSnippet = res.data.adsTxtSnippet;
				this.setState({
					adsTxtSnippet,
					sites,
					isLoading: false
				});
			})
			.catch(() => {
				const { showNotification } = this.props;
				showNotification({
					mode: 'error',
					message: 'Some error occured while fetching Ads.txt.',
					autoDismiss: 5
				});
			});
	}

	getSitesAdstxtStatus = () => {
		const { sites } = this.props;
		console.log(sites);
		return Promise.map(Object.keys(sites), site =>
			proxyService
				.verifyAdsTxtCode(sites[site].siteDomain)
				.then(res => {
					console.log(res);
					if (res.status == 200)
						return {
							domain: sites[site].siteDomain,
							status: res.data.errorCode,
							adsTxt: res.data.ourAdsTxt
						};
				})
				.catch(res => ({
					domain: sites[site].siteDomain,
					status: 3
				}))
		);
	};

	renderLoader = () => (
		<div style={{ position: 'relative', width: '100%', height: '100%' }}>
			<Loader />
		</div>
	);

	handleClose = () => {
		this.setState({ showModal: false });
	};

	showModalHandler = () => {
		this.setState({ showModal: true });
	};

	renderModal = () => {
		const { showSendCodeByEmailModal, modalAdsTxt } = this.state;
		return (
			<Modal show={this.state.showModal} onHide={this.handleClose}>
				<Modal.Header closeButton>
					<Modal.Title>Missing Entries</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<div className="u-padding-4">
						The following entries are missing. To avoid loss in revenue, please append the following
						entries in your ads.txt file.
					</div>
					<div className="u-padding-4 text-center snippet-wrapper">
						<textarea
							readOnly
							className="input--snippet"
							style={{ height: '50%' }}
							id="adsTxtSnippetTextarea"
							placeholder="AdPushup init code comes here.."
							value={modalAdsTxt}
						/>
						<div className="snippet-btn-wrapper aligner aligner--hEnd u-padding-v3 u-padding-h3">
							<CustomButton
								onClick={this.toggleShowSendCodeByEmailModal}
								variant="secondary"
								className="u-margin-r3 snippet-btn apbtn-main-line apbtn-small"
								style={{ width: '170px' }}
							>
								Email Code
							</CustomButton>
							<SendCodeByEmailModal
								show={showSendCodeByEmailModal}
								title="Send Code to Developer"
								handleClose={this.toggleShowSendCodeByEmailModal}
								subject="Adpushup HeadCode"
								emailBody={this.getEmailBody(modalAdsTxt)}
							/>

							<CustomButton
								onClick={this.onCopyToClipBoard}
								variant="secondary"
								className="snippet-btn apbtn-main-line apbtn-small"
								style={{ width: '170px' }}
							>
								Copy to clipboard
							</CustomButton>
						</div>
					</div>
				</Modal.Body>
			</Modal>
		);
	};

	toggleShowSendCodeByEmailModal = () => {
		this.setState(state => ({ showSendCodeByEmailModal: !state.showSendCodeByEmailModal }));
	};

	onCopyToClipBoard = () => {
		document.getElementById('adsTxtSnippetTextarea').focus();
		document.getElementById('adsTxtSnippetTextarea').select();
		copyToClipBoard(this.state.adsTxtSnippet);
	};

	renderSiteStatusTable = () => {
		const { sites } = this.state;
		return (
			<div className="u-padding-4">
				<div className="u-padding-b4">Check if Ads.txt entries are upto date:</div>
				<Table striped bordered hover>
					<thead>
						<tr>
							{ADSTXT_SITE_LIST_HEADERS.map(header => (
								<th key={`headerKey-${header.key}`}>{header.displayText}</th>
							))}
						</tr>
					</thead>
					<tbody>
						{sites.map((site, index) => (
							<tr key={index}>
								<td>{site.domain}</td>
								<td>{ADSTXT_STATUS[site.status]}</td>
								<td>
									<CustomButton
										onClick={() => {
											this.setState({
												showModal: true,
												modalAdsTxt: site.adsTxt
											});
										}}
										variant="secondary"
										className="snippet-btn apbtn-main-line apbtn-small"
										style={{ width: '170px' }}
										disabled={site.status == 0}
									>
										Get Entries
									</CustomButton>
								</td>
							</tr>
						))}
					</tbody>
				</Table>
			</div>
		);
	};

	getEmailBody = adsTxtSnippet => {
		const mailHeader = `Hi, <br/> Please find below the Ads.txt entries, append the following entries on the root domain of your website.\n\n`;
		const mailFooter = '<br/><br/>Thanks,<br/>Team AdPushup';
		const emailBody = `${mailHeader}<pre style="background-color: #eaeaea; padding: 20px; margin-top: 10px;">${adsTxtSnippet}</pre>${mailFooter}`;
		return emailBody;
	};

	renderSnippetTextarea = () => {
		const { showSendCodeByEmailModal, adsTxtSnippet } = this.state;
		return (
			<div>
				<div className="u-padding-4">
					Ensure that ads.txt is updated to all times to ensure maximum advertising partners are
					bidding on your website.
				</div>
				<div className="u-padding-4 text-center snippet-wrapper">
					<textarea
						readOnly
						className="input--snippet"
						style={{ height: '50%' }}
						id="adsTxtSnippetTextarea"
						placeholder="AdPushup init code comes here.."
						value={adsTxtSnippet}
					/>
					<div className="snippet-btn-wrapper aligner aligner--hEnd u-padding-v3 u-padding-h3">
						<CustomButton
							onClick={this.toggleShowSendCodeByEmailModal}
							variant="secondary"
							className="u-margin-r3 snippet-btn apbtn-main-line apbtn-small"
							style={{ width: '170px' }}
						>
							Email Code
						</CustomButton>
						<SendCodeByEmailModal
							show={showSendCodeByEmailModal}
							title="Send Code to Developer"
							handleClose={this.toggleShowSendCodeByEmailModal}
							subject="Adpushup HeadCode"
							emailBody={this.getEmailBody(adsTxtSnippet)}
						/>

						<CustomButton
							onClick={this.onCopyToClipBoard}
							variant="secondary"
							className="snippet-btn apbtn-main-line apbtn-small"
							style={{ width: '170px' }}
						>
							Copy to clipboard
						</CustomButton>
					</div>
				</div>
			</div>
		);
	};

	handleNavSelect = value => {
		const computedRedirectUrl = `/adsTxtManagement`;
		let redirectUrl = '';
		switch (value) {
			default:
			case 1:
				redirectUrl = `${computedRedirectUrl}`;
				break;
			case 2:
				redirectUrl = `${computedRedirectUrl}/entries`;
				break;
		}
		this.setState({
			redirectUrl
		});
	};

	renderContent = () => {
		const activeTab = this.getActiveTab();
		switch (activeTab) {
			default:
			case ADSTXT_NAV_ITEMS_INDEXES.AUTHENTICATOR:
				return this.renderSiteStatusTable();
			case ADSTXT_NAV_ITEMS_INDEXES.ENTRIES:
				return this.renderSnippetTextarea();
		}
	};

	getActiveTab = () => {
		const {
			customProps: { activeTab }
		} = this.props;

		return activeTab;
	};

	render() {
		const { isLoading } = this.state;
		const { redirectUrl } = this.state;
		const activeTab = this.getActiveTab();
		const activeItem = ADSTXT_NAV_ITEMS[activeTab];

		if (redirectUrl) {
			return <Redirect to={{ pathname: redirectUrl }} />;
		}
		return (
			<Fragment>
				<Helmet>
					<title>Ads.txt Management</title>
				</Helmet>

				<ActionCard title="Ads.txt Manager">
					{this.renderModal()}
					{isLoading ? (
						this.renderLoader()
					) : (
						<div>
							<Nav bsStyle="tabs" activeKey={activeItem.INDEX} onSelect={this.handleNavSelect}>
								<NavItem eventKey={1}>{ADSTXT_NAV_ITEMS_VALUES.AUTHENTICATOR}</NavItem>
								<NavItem eventKey={2}>{ADSTXT_NAV_ITEMS_VALUES.ENTRIES}</NavItem>
							</Nav>
							{this.renderContent()}
							<Alert bsStyle="warning" className="u-margin-4">
								<strong>Bonus: </strong> Manage ads.txt for all yourpartners with AdPushup&#8217;s{' '}
								<a className="u-text-underline" href="http://console.adpushup.com/adstxt">
									ads.txt management solution
								</a>
								.
							</Alert>
							<Alert bsStyle="warning" className="u-margin-4">
								<strong>Note: </strong> Ads.txt is mandatory. It needs to be updated incase you
								already have one. Else please follow the intsructions provided here :{' '}
								<a
									className="u-text-underline"
									href="https://support.google.com/admanager/answer/7441288?hl=en"
								>
									https://support.google.com/admanager/answer/7441288?hl=en
								</a>
								{'. '}
								AdPushup&#8217;s ads.txt should be appended alongside your existing partners.
							</Alert>
						</div>
					)}
				</ActionCard>
			</Fragment>
		);
	}
}

const mapStateToProps = state => {
	const { sites } = state.global;
	return { sites: sites.data };
};

export default connect(
	mapStateToProps,
	{ showNotification }
)(AdsTxtManager);
