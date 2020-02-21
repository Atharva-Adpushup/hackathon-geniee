import React, { Component, Fragment } from 'react';
import DocumentTitle from 'react-document-title';
import { Col, Table, Modal, Nav, NavItem } from '@/Client/helpers/react-bootstrap-imports';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import proxyService from '../../services/proxyService';
import { showNotification } from '../../actions/uiActions';
import Loader from '../../Components/Loader/index';
import { ADSTXT_SITE_LIST_HEADERS } from '../../constants/others';
import CustomButton from '../../Components/CustomButton';
import CustomMessage from '../../Components/CustomMessage/index';
import CopyButtonWrapperContainer from '../../Containers/CopyButtonWrapperContainer';
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
		redirectUrl: '',
		sendCodeByEmailModalContent: ''
	};

	componentDidMount() {
		const {
			user: { email }
		} = this.props;

		const getDataPromises = [
			proxyService.getAdsTxt(),
			proxyService.getMandatoryAdsTxtEntry({ email })
		];

		return Promise.all(getDataPromises)
			.then(([adsTxtRes, mandatoryAdsTxtEntryRes]) => {
				let snippet = '';
				let mandatoryAdsTxtEntry = '';

				if (adsTxtRes.status === 200) snippet = adsTxtRes.data.adsTxtSnippet;
				if (mandatoryAdsTxtEntryRes.status === 200)
					mandatoryAdsTxtEntry = mandatoryAdsTxtEntryRes.data.mandatoryAdsTxtEntry;

				return [snippet, mandatoryAdsTxtEntry];
			})
			.then(([snippet, mandatoryAdsTxtEntry]) =>
				this.getSitesAdstxtStatus().then(response => {
					this.setState({
						mandatoryAdsTxtEntry,
						adsTxtSnippet: snippet,
						sites: response,
						isLoading: false
					});
				})
			);
	}

	getSitesAdstxtStatus = () => {
		const { sites } = this.props;

		const statusText = {
			204: 'No Content',
			206: 'Partial Content'
		};

		const promiseSerial = funcs =>
			funcs.reduce(
				(promise, obj) =>
					promise.then(all => {
						const { func, site } = obj;
						return func()
							.then(() => {
								const result = {
									domain: sites[site].siteDomain,
									genericStatus: 'Entries Upto Date',
									genericError: false,
									isComplete: true
								};
								return all.concat(result);
							})
							.catch(error => {
								let result = {
									isComplete: false,
									domain: sites[site].siteDomain
								};

								if (error.response) {
									const errorResponse = error.response.data;

									if (error.response.status === 400) {
										const {
											error: errors,
											data: { ourAdsTxt, mandatoryAdsTxtEntry }
										} = errorResponse;

										for (let index = 0; index < errors.length; index += 1) {
											const { error: err, type, code } = errors[index];

											if (type === 'ourAdsTxt') {
												result.adsTxt = ourAdsTxt;
												result.ourAdsTxtStatus = statusText[code];
											} else {
												result.mandatoryAdsTxtEntryStatus = err;
												result.mandatoryAdsTxtEntry = mandatoryAdsTxtEntry;
											}
										}
									} else if (error.response.status === 404) {
										const { ourAdsTxt, mandatoryAdsTxtEntry } = errorResponse.data;
										const {
											ourAdsTxt: ourAdsTxtError,
											mandatoryAdsTxtEntry: mandatoryAdsTxtEntryError
										} = errorResponse.error;

										result = {
											...result,
											adsTxt: ourAdsTxt,
											mandatoryAdsTxtEntry,
											ourAdsTxtStatus: ourAdsTxtError,
											mandatoryAdsTxtEntryStatus: mandatoryAdsTxtEntryError
										};
									} else {
										result = {
											...result,
											adsTxt: '',
											mandatoryAdsTxtEntry: '',
											genericStatus: errorResponse.error,
											genericError: true
										};
									}
								} else {
									result = {
										...result,
										adsTxt: '',
										mandatoryAdsTxtEntry: '',
										genericStatus: 'Something went wrong!',
										genericError: true
									};
								}

								return all.concat(result);
							});
					}),
				Promise.resolve([])
			);
		const funcs = Object.keys(sites).map(site => ({
			func: () => proxyService.verifyAdsTxtCode(sites[site].siteDomain, sites[site].siteId),
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
		const {
			showModal,
			modalAdsTxt,
			modalMandatoryAdsTxtEntry,
			showSendCodeByEmailModal,
			sendCodeByEmailModalContent
		} = this.state;

		return (
			<Modal show={showModal} onHide={this.handleClose}>
				<Modal.Header closeButton>
					<Modal.Title>Missing Entries</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<div className="u-padding-3">
						{modalMandatoryAdsTxtEntry && modalAdsTxt ? (
							<span className="u-padding-b3 u-text-bold u-text-primary-red">
								Please add entries from both the sections below to avoid revenue loss
							</span>
						) : (
							'The following entries are missing. To avoid loss in revenue, please append the following entries in your ads.txt file.'
						)}
					</div>
					<div className="snippet-wrapper text-center u-padding-b4 u-padding-h4 u-padding-t3">
						<SendCodeByEmailModal
							show={showSendCodeByEmailModal}
							title="Send Code to Developer"
							handleClose={this.toggleShowSendCodeByEmailModal}
							subject="AdPushup Ads.txt Entries"
							emailBody={sendCodeByEmailModalContent}
						/>

						{modalMandatoryAdsTxtEntry && (
							<div className="">
								<div className="u-padding-b3 u-text-bold u-text-primary-red">
									Mandatory Ads.txt entry
								</div>
								<textarea
									readOnly
									className="input--snippet"
									style={{ height: '15%' }}
									id="mandatoryAdsTxtSnippetTextarea"
									placeholder="Mandatory Ads.txt Entry comes here.."
									value={modalMandatoryAdsTxtEntry}
								/>
								<div className="snippet-btn-wrapper aligner aligner--hEnd u-padding-v3">
									<CustomButton
										onClick={() => {
											this.setState({
												sendCodeByEmailModalContent: this.getEmailBody(modalMandatoryAdsTxtEntry)
											});
											this.toggleShowSendCodeByEmailModal();
										}}
										variant="secondary"
										className="u-margin-r3 snippet-btn apbtn-main-line apbtn-small"
										style={{ width: '170px' }}
									>
										Email Code
									</CustomButton>
									<CopyButtonWrapperContainer
										content={modalMandatoryAdsTxtEntry}
										callback={() => this.onCopyToClipBoard('mandatoryAdsTxtSnippetTextarea')}
									>
										<CustomButton
											variant="secondary"
											className="snippet-btn apbtn-main-line apbtn-small"
											style={{ width: '170px' }}
										>
											Copy to clipboard
										</CustomButton>
									</CopyButtonWrapperContainer>
								</div>
							</div>
						)}

						{modalAdsTxt && (
							<div className="u-padding-v3">
								<textarea
									readOnly
									className="input--snippet"
									style={{ height: '40%' }}
									id="adsTxtSnippetTextarea"
									placeholder="AdPushup init code comes here.."
									value={modalAdsTxt}
								/>
								<div className="snippet-btn-wrapper aligner aligner--hEnd u-padding-v3">
									<CustomButton
										onClick={() => {
											this.setState({
												sendCodeByEmailModalContent: this.getEmailBody(modalAdsTxt)
											});
											this.toggleShowSendCodeByEmailModal();
										}}
										variant="secondary"
										className="u-margin-r3 snippet-btn apbtn-main-line apbtn-small"
										style={{ width: '170px' }}
									>
										Email Code
									</CustomButton>
									<CopyButtonWrapperContainer
										content={modalAdsTxt}
										callback={() => this.onCopyToClipBoard('adsTxtSnippetTextarea')}
									>
										<CustomButton
											variant="secondary"
											className="snippet-btn apbtn-main-line apbtn-small"
											style={{ width: '170px' }}
										>
											Copy to clipboard
										</CustomButton>
									</CopyButtonWrapperContainer>
								</div>
							</div>
						)}
					</div>
				</Modal.Body>
			</Modal>
		);
	};

	toggleShowSendCodeByEmailModal = () => {
		this.setState(state => ({ showSendCodeByEmailModal: !state.showSendCodeByEmailModal }));
	};

	onCopyToClipBoard = targetId => {
		document.getElementById(targetId).focus();
		document.getElementById(targetId).select();
	};

	getSiteStatusText = site => {
		if (site.genericStatus) {
			return (
				<span className={site.genericError ? 'u-text-primary-red' : ''}>{site.genericStatus}</span>
			);
		}
		const siteStatusText = [];

		if (site.ourAdsTxtStatus) {
			siteStatusText.push(<span key={`${site.domain}`}>{site.ourAdsTxtStatus}</span>);
		}
		if (site.mandatoryAdsTxtEntryStatus) {
			siteStatusText.push(
				<p key={`${site.domain}_mandatory`} className="u-text-primary-red u-text-bold u-margin-0">
					{site.mandatoryAdsTxtEntryStatus}
				</p>
			);
		}

		return siteStatusText;
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
						{sites && sites.length > 0 ? (
							sites.map(site => (
								<tr key={site.domain}>
									<td>{site.domain}</td>
									<td>{this.getSiteStatusText(site)}</td>
									<td>
										<CustomButton
											onClick={() => {
												this.setState({
													showModal: true,
													modalAdsTxt: site.adsTxt,
													modalMandatoryAdsTxtEntry: site.mandatoryAdsTxtEntry
												});
											}}
											variant="secondary"
											className="snippet-btn apbtn-main-line apbtn-small"
											style={{ width: '170px' }}
											disabled={site.isComplete || site.genericError}
										>
											Get Entries
										</CustomButton>
									</td>
								</tr>
							))
						) : (
							<div className="text-center">No Record Found.</div>
						)}
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
		const {
			adsTxtSnippet,
			mandatoryAdsTxtEntry,
			showSendCodeByEmailModal,
			sendCodeByEmailModalContent
		} = this.state;
		return (
			<div>
				<div className="u-padding-4">
					Ensure that ads.txt is updated to all sites to ensure maximum advertising partners are
					bidding on your website.
				</div>
				<div className="u-padding-4 text-center snippet-wrapper">
					<SendCodeByEmailModal
						show={showSendCodeByEmailModal}
						title="Send Code to Developer"
						handleClose={this.toggleShowSendCodeByEmailModal}
						subject="AdPushup Ads.txt Entries"
						emailBody={sendCodeByEmailModalContent}
					/>
					<div>
						<div className="u-padding-b3 u-text-bold u-text-primary-red">
							Mandatory Ads.txt entry
						</div>
						<textarea
							readOnly
							className="input--snippet"
							style={{ height: '15%' }}
							id="mandatoryAdsTxtSnippetTextarea"
							placeholder="Mandatory Ads.txt Entry comes here.."
							value={mandatoryAdsTxtEntry}
						/>

						<div className="snippet-btn-wrapper aligner aligner--hEnd u-padding-v3 u-padding-h3">
							<CustomButton
								onClick={() => {
									this.setState({
										sendCodeByEmailModalContent: this.getEmailBody(mandatoryAdsTxtEntry)
									});
									this.toggleShowSendCodeByEmailModal();
								}}
								variant="secondary"
								className="u-margin-r3 snippet-btn apbtn-main-line apbtn-small"
								style={{ width: '170px' }}
							>
								Email Code
							</CustomButton>

							<CopyButtonWrapperContainer
								content={mandatoryAdsTxtEntry}
								callback={() => this.onCopyToClipBoard('mandatoryAdsTxtSnippetTextarea')}
							>
								<CustomButton
									variant="secondary"
									className="snippet-btn apbtn-main-line apbtn-small"
									style={{ width: '170px' }}
								>
									Copy to clipboard
								</CustomButton>
							</CopyButtonWrapperContainer>
						</div>
					</div>

					<div className="u-padding-t5">
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
								onClick={() => {
									this.setState({
										sendCodeByEmailModalContent: this.getEmailBody(adsTxtSnippet)
									});
									this.toggleShowSendCodeByEmailModal();
								}}
								variant="secondary"
								className="u-margin-r3 snippet-btn apbtn-main-line apbtn-small"
								style={{ width: '170px' }}
							>
								Email Code
							</CustomButton>
							<CopyButtonWrapperContainer
								content={adsTxtSnippet}
								callback={() => this.onCopyToClipBoard('adsTxtSnippetTextarea')}
							>
								<CustomButton
									variant="secondary"
									className="snippet-btn apbtn-main-line apbtn-small"
									style={{ width: '170px' }}
								>
									Copy to clipboard
								</CustomButton>
							</CopyButtonWrapperContainer>
						</div>
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
				<DocumentTitle title="Ads.txt Management" />

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
	const { sites, user } = state.global;
	return { sites: sites.data, user: user.data };
};

export default connect(
	mapStateToProps,
	{ showNotification }
)(AdsTxtManager);
