import React from 'react';
import {
	Form,
	Col,
	FormGroup,
	ControlLabel,
	HelpBlock
} from '@/Client/helpers/react-bootstrap-imports';
import Loader from '../../../Components/Loader';
import InputBox from '../../../Components/InputBox';
import CustomButton from '../../../Components/CustomButton';

import { getHubspotCompanyInfo, sendDomainForHBApproval } from '../../../services/hbService';
import { domanize } from '../../../helpers/commonFunctions';
import { HB_APPROVAL } from '../constants/index';

class HBApprovalTab extends React.Component {
	state = {
		isSavingSettings: false,
		revenue: '',
		isCompanyAssociatedWithGeniee: false,
		isCompanyAssociatedWithGenieeInc: false,
		isCompanyAssociatedWithGenieeInternational: false,
		formSaved: false,
		isHubspotCompanyInfoLoading: true
	};

	componentDidMount() {
		const { siteId, user } = this.props;
		const siteIdObject = user.sites[siteId];
		const { domain } = siteIdObject;
		const siteDomain = domanize(domain);
		const params = {
			siteDomain
		};
		getHubspotCompanyInfo(params)
			.then(companyInfo => {
				if (companyInfo.error) {
					this.setState({
						companyDoesNotExistsErr: companyInfo.error
					});
				} else {
					this.updateInputFields(companyInfo);
				}
				this.setState({ siteDomain, isHubspotCompanyInfoLoading: false });
			})
			.catch(err => this.showNotifications('error', 'Error', HB_APPROVAL.internalSeverError));
	}

	updateInputFields = companyInfo => {
		const {
			companyName = 'Not found',
			hubspotCompanyId = 'Not found',
			siteAlreadyExistsinSOTSheet = false
		} = companyInfo;
		this.setState({
			hubspotCompanyId,
			companyName,
			siteAlreadyExistsinSOTSheet
		});
	};

	handleChange = e => {
		this.setState({
			[e.target.name]: e.target.value
		});
	};

	showNotifications = (mode, title, message) => {
		const { showNotification } = this.props;
		showNotification({
			mode,
			title,
			message,
			autoDismiss: 5
		});
	};

	addRevenueForSite = (revenueDataToSave, setUnsavedChangesAction) => {
		sendDomainForHBApproval(revenueDataToSave)
			.then(() => {
				this.setState({ isSavingSettings: false, formSaved: true }, () => {
					setUnsavedChangesAction(true);
					this.showNotifications('success', 'Success', HB_APPROVAL.saveSuccessfulMessage);
				});
			})
			.catch(() => {
				this.setState({ isSavingSettings: false }, () => {
					this.showNotifications('error', 'Error', HB_APPROVAL.saveErrorMessage);
				});
			});
	};

	getHubspotCompanyId = () => {
		const {
			isCompanyAssociatedWithGeniee,
			isCompanyAssociatedWithGenieeInc,
			hubspotCompanyId
		} = this.state;
		if (!isCompanyAssociatedWithGeniee) {
			return hubspotCompanyId;
		}
		if (isCompanyAssociatedWithGenieeInc) {
			return HB_APPROVAL.hubspotIdForGenieeInc;
		}
		return HB_APPROVAL.hubspotIdForGenieeInternationals;
	};

	getHubspotCompanyName = () => {
		const {
			isCompanyAssociatedWithGeniee,
			isCompanyAssociatedWithGenieeInc,
			companyName
		} = this.state;
		if (!isCompanyAssociatedWithGeniee) {
			return companyName;
		}
		if (isCompanyAssociatedWithGenieeInc) {
			return HB_APPROVAL.hubspotCompanyNameForGenieeInc;
		}
		return HB_APPROVAL.hubspotCompanyNameForGenieeInternationals;
	};

	saveSettings = e => {
		e.preventDefault();
		const { siteId, setUnsavedChangesAction } = this.props;
		const { revenue, siteDomain } = this.state;
		if (!revenue) {
			return this.showNotifications('error', 'Error', HB_APPROVAL.revenueInvalidMessage);
		}
		const confirmed = window.confirm(HB_APPROVAL.saveFormConfirmMessage);
		if (!confirmed) return null;
		const revenueDataToSave = {
			companyId: this.getHubspotCompanyId(),
			companyName: this.getHubspotCompanyName(),
			siteId,
			companyRevenue: revenue,
			currentlyAddedDomain: siteDomain
		};
		this.setState({ isSavingSettings: true });
		this.addRevenueForSite(revenueDataToSave, setUnsavedChangesAction);
		return null;
	};

	handleGenieeIncSelectionInputChange() {
		this.setState({
			isCompanyAssociatedWithGeniee: true,
			isCompanyAssociatedWithGenieeInc: true,
			isCompanyAssociatedWithGenieeInternational: false
		});
	}

	handleGenieeInternationalSelectionInputChange() {
		this.setState({
			isCompanyAssociatedWithGeniee: true,
			isCompanyAssociatedWithGenieeInc: false,
			isCompanyAssociatedWithGenieeInternational: true
		});
	}

	renderForm = () => {
		const {
			isSavingSettings,
			hubspotCompanyId,
			companyName,
			companyDoesNotExistsErr,
			revenue,
			isCompanyAssociatedWithGeniee,
			isCompanyAssociatedWithGenieeInc,
			isCompanyAssociatedWithGenieeInternational,
			formSaved,
			siteAlreadyExistsinSOTSheet
		} = this.state;

		const toShowCompanyDoesNotExistsMessage =
			companyDoesNotExistsErr && !isCompanyAssociatedWithGeniee;

		return (
			<Form onSubmit={this.saveSettings}>
				{toShowCompanyDoesNotExistsMessage && (
					<HelpBlock className="error-message" style={{ padding: '0 1.5rem' }}>
						{companyDoesNotExistsErr}
					</HelpBlock>
				)}
				<FormGroup controlId="publisherId" className="form-row clearfix">
					<Col componentClass={ControlLabel} sm={6}>
						Hubspot Company Id
					</Col>
					<Col sm={6}>
						<InputBox
							type="text"
							name="hubspotCompanyId"
							value={companyDoesNotExistsErr ? 'Not found' : hubspotCompanyId}
							disabled
						/>
					</Col>
				</FormGroup>

				<div className="form-row clearfix">
					<Col componentClass={ControlLabel} sm={6}>
						Company Name
					</Col>
					<Col sm={6}>
						<InputBox
							type="text"
							name="companyName"
							value={companyDoesNotExistsErr ? 'Not found' : companyName}
							disabled
						/>
					</Col>
				</div>

				<div className="form-row clearfix">
					<Col componentClass={ControlLabel} sm={6}>
						Revenue
					</Col>
					<Col sm={6}>
						<InputBox type="number" name="revenue" value={revenue} onChange={this.handleChange} />
					</Col>
				</div>

				{companyDoesNotExistsErr && (
					<div className="form-row clearfix">
						<Col componentClass={ControlLabel} sm={6}>
							Is this under Geniee ownership?
						</Col>
						<Col sm={3}>
							Geniee Inc
							<Col>
								<input
									type="radio"
									name="isCompanyAssociatedWithGeniee"
									value={isCompanyAssociatedWithGenieeInc}
									onChange={() => {
										this.handleGenieeIncSelectionInputChange();
									}}
								/>
							</Col>
						</Col>
						<Col sm={3}>
							Geniee International
							<Col>
								<input
									type="radio"
									name="isCompanyAssociatedWithGeniee"
									value={isCompanyAssociatedWithGenieeInternational}
									onChange={() => {
										this.handleGenieeInternationalSelectionInputChange();
									}}
								/>
							</Col>
						</Col>
					</div>
				)}

				<div className="footer-btns">
					<CustomButton
						variant="primary"
						type="submit"
						showSpinner={isSavingSettings}
						disabled={toShowCompanyDoesNotExistsMessage || siteAlreadyExistsinSOTSheet || formSaved}
					>
						Save
					</CustomButton>
				</div>
				{siteAlreadyExistsinSOTSheet && (
					<HelpBlock className="error-message" style={{ padding: '0 1.5rem' }}>
						This site is already approved or revenue already exists in the SOT Sheet for this domain
					</HelpBlock>
				)}
			</Form>
		);
	};

	render() {
		const { isHubspotCompanyInfoLoading } = this.state;
		return (
			<div className="options-wrapper white-tab-container hb-prebid-settings">
				{isHubspotCompanyInfoLoading ? <Loader /> : this.renderForm()}
			</div>
		);
	}
}

export default HBApprovalTab;
