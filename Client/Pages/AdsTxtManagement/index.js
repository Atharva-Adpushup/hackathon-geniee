import React, { Component, Fragment } from 'react';
import { Helmet } from 'react-helmet';
import { Col, Table, Modal, Nav, NavItem } from 'react-bootstrap';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import ActionCard from '../../Components/ActionCard/index';
import proxyService from '../../services/proxyService';
import { showNotification } from '../../actions/uiActions';
import Loader from '../../Components/Loader/index';
import { ADSTXT_SITE_LIST_HEADERS } from '../../constants/others';
import CustomButton from '../../Components/CustomButton';
import CustomMessage from '../../Components/CustomMessage/index';
import { copyToClipBoard } from '../../Apps/ApTag/lib/helpers';
import SendCodeByEmailModal from '../../Components/SendCodeByEmailModal';
import '../../scss/pages/adsTxtManagement/index.scss';
import {
	ADSTXT_NAV_ITEMS,
	ADSTXT_NAV_ITEMS_INDEXES,
	ADSTXT_NAV_ITEMS_VALUES,
	BONUS_MESSAGE,
	NOTE_MESSAGE
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
		Promise.all([proxyService.getAdsTxt(), this.getSitesAdstxtStatus()]).then(response => {
			let snippet;
			if (response[0].status === 200) snippet = response[0].data.adsTxtSnippet;
			this.setState({
				adsTxtSnippet: snippet,
				sites: response[1],
				isLoading: false
			});
		});
	}

	getSitesAdstxtStatus = () => {
		const { sites, adsTxt } = this.props;
		const promiseSerial = funcs =>
			funcs.reduce(
				(promise, obj) =>
					promise.then(all => {
						const { func, site } = obj;
						return func()
							.then(res => {
								let result;
								if (res.status === 200)
									result = {
										domain: sites[site].siteDomain,
										statusText: 'Entries Upto Date',
										status: res.status
									};
								else if (res.status === 204)
									result = {
										domain: sites[site].siteDomain,
										statusText: res.statusText,
										adsTxt,
										status: res.status
									};
								else {
									result = {
										domain: sites[site].siteDomain,
										statusText: res.statusText,
										adsTxt: res.data.ourAdsTxt,
										status: res.status
									};
								}
								return all.concat(result);
							})
							.catch(error => {
								const result = {
									domain: sites[site].siteDomain,
									statusText: 'No Ads.txt Found',
									adsTxt: error.response.data.ourAdsTxt,
									status: 400
								};
								return all.concat(result);
							});
					}),
				Promise.resolve([])
			);
		const funcs = Object.keys(sites).map(site => ({
			func: () => proxyService.verifyAdsTxtCode(sites[site].siteDomain),
			site
		}));

		return promiseSerial(funcs).then(res => res);
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
		const { showSendCodeByEmailModal, modalAdsTxt, showModal } = this.state;
		return (
			<Modal show={showModal} onHide={this.handleClose}>
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
								subject="AdPushup Ads.txt Entries"
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
		const { adsTxtSnippet } = this.state;
		document.getElementById('adsTxtSnippetTextarea').focus();
		document.getElementById('adsTxtSnippetTextarea').select();
		copyToClipBoard(adsTxtSnippet);
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
						{sites.map(site => (
							<tr key={site.domain}>
								<td>{site.domain}</td>
								<td>{site.statusText}</td>
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
										disabled={site.status === 200}
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
							subject="AdPushup Ads.txt Entries"
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

				<div title="Ads.txt Manager">
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
							<Col xs={12}>
								<CustomMessage header="Bonus" type="info" message={BONUS_MESSAGE} />
								<CustomMessage header="Note" type="info" message={NOTE_MESSAGE} />
							</Col>
						</div>
					)}
				</div>
			</Fragment>
		);
	}
}

const mapStateToProps = state => {
	const { sites, adsTxt } = state.global;
	return { sites: sites.data, adsTxt: adsTxt.data };
};

export default connect(
	mapStateToProps,
	{ showNotification }
)(AdsTxtManager);
