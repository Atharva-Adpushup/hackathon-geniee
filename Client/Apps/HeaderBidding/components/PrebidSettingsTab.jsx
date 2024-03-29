import React from 'react';
import {
	Form,
	Col,
	FormGroup,
	ControlLabel,
	HelpBlock,
	ButtonToolbar,
	ToggleButtonGroup,
	Checkbox
} from '@/Client/helpers/react-bootstrap-imports';
import InputBox from '../../../Components/InputBox';
import CustomButton from '../../../Components/CustomButton';
import Loader from '../../../Components/Loader';
import { HEADER_BIDDING } from '../constants';
import { fetchPrebidSettings, updatePrebidSettings } from '../../../services/hbService';

class PrebidSettingsTab extends React.Component {
	state = {
		errors: {
			timeOut: '',
			refreshTimeOut: ''
		},
		isSavingSettings: false
	};

	componentDidMount() {
		const { siteId } = this.props;
		fetchPrebidSettings(siteId).then(prebidSettings => {
			this.setState(prebidSettings);
		});
	}

	handleTimeOut = ({ target: { value: timeOut } }, type) => {
		// eslint-disable-next-line no-param-reassign
		timeOut = Number(timeOut);
		let minAllowedTime = HEADER_BIDDING.INITIAL_TIMEOUT.MIN;
		let maxAllowedTime = HEADER_BIDDING.INITIAL_TIMEOUT.MAX;

		if (type === 'refreshTimeOut') {
			minAllowedTime = HEADER_BIDDING.REFRESH_TIMEOUT.MIN;
			maxAllowedTime = HEADER_BIDDING.REFRESH_TIMEOUT.MAX;
		}

		this.setState(state => ({
			[type]: timeOut,
			errors: {
				...state.errors,
				[type]: !(!Number.isNaN(timeOut) && timeOut >= minAllowedTime && timeOut <= maxAllowedTime)
					? `Timeout should be between ${minAllowedTime}ms to ${maxAllowedTime}ms`
					: ''
			}
		}));
	};

	savePrebidSettings = e => {
		e.preventDefault();

		const {
			errors: { timeOut: timeOutError, refreshTimeOut: refreshTimeOutError }
		} = this.state;

		if (timeOutError || refreshTimeOutError) {
			return alert('Please resolve the error before saving');
		}

		// eslint-disable-next-line no-alert
		const confirmed = window.confirm('Are you sure?');

		if (!confirmed) return;

		const { siteId, showNotification, setUnsavedChangesAction, customProps, user } = this.props;
		const { timeOut, refreshTimeOut } = this.state;

		const dataForAuditLogs = {
			appName: customProps.appName,
			siteDomain: user.sites[siteId].domain
		};

		const isValidInitialTimeout =
			!Number.isNaN(timeOut) &&
			timeOut >= HEADER_BIDDING.INITIAL_TIMEOUT.MIN &&
			timeOut <= HEADER_BIDDING.INITIAL_TIMEOUT.MAX;

		const isValidRefreshTimeout =
			!Number.isNaN(refreshTimeOut) &&
			refreshTimeOut >= HEADER_BIDDING.REFRESH_TIMEOUT.MIN &&
			refreshTimeOut <= HEADER_BIDDING.REFRESH_TIMEOUT.MAX;

		if (isValidInitialTimeout && isValidRefreshTimeout) {
			const newPrebidSettings = { timeOut, refreshTimeOut };

			this.setState({ isSavingSettings: true });
			updatePrebidSettings(siteId, newPrebidSettings, dataForAuditLogs)
				.then(() => {
					this.setState({ isSavingSettings: false }, () => {
						setUnsavedChangesAction(true);

						showNotification({
							mode: 'success',
							title: 'Success',
							message: 'Prebid Settings Saved Successfully',
							autoDismiss: 5
						});
					});
				})
				.catch(() => {
					this.setState({ isSavingSettings: false }, () => {
						showNotification({
							mode: 'error',
							title: 'Error',
							message: 'Unable to save Prebid settings',
							autoDismiss: 5
						});
					});
				});
		}
	};

	renderForm = () => {
		const {
			timeOut,
			refreshTimeOut,
			currency: { code: currencyCode },

			adServer,
			errors: { timeOut: timeOutError, refreshTimeOut: refreshTimeOutError },
			isSavingSettings
		} = this.state;

		return (
			<Form onSubmit={this.savePrebidSettings}>
				<FormGroup controlId="pb-timeout" className="form-row clearfix">
					<Col componentClass={ControlLabel} sm={6}>
						Initial Time-Out (ms)
					</Col>
					<Col sm={6}>
						<InputBox
							type="number"
							name="pb-timeout"
							classNames="pb-input"
							value={timeOut}
							onChange={e => this.handleTimeOut(e, 'timeOut')}
						/>
					</Col>
					{!!timeOutError && (
						<HelpBlock className="error-message" style={{ padding: '0 1.5rem' }}>
							{timeOutError}
						</HelpBlock>
					)}
				</FormGroup>

				<FormGroup controlId="pb-timeout" className="form-row clearfix">
					<Col componentClass={ControlLabel} sm={6}>
						Refresh Time-Out (ms)
					</Col>
					<Col sm={6}>
						<InputBox
							type="number"
							name="pb-timeout"
							classNames="pb-input"
							value={refreshTimeOut}
							onChange={e => this.handleTimeOut(e, 'refreshTimeOut')}
						/>
					</Col>
					{!!refreshTimeOutError && (
						<HelpBlock className="error-message" style={{ padding: '0 1.5rem' }}>
							{refreshTimeOutError}
						</HelpBlock>
					)}
				</FormGroup>

				<div className="form-row clearfix">
					<Col componentClass={ControlLabel} sm={6}>
						AdServer
					</Col>
					<Col sm={6}>{adServer}</Col>
				</div>

				<div className="form-row clearfix">
					<Col componentClass={ControlLabel} sm={6}>
						AdServer Currency
					</Col>
					<Col sm={6}>{currencyCode || 'N/A'}</Col>
				</div>

				<div className="footer-btns">
					<CustomButton variant="primary" type="submit" showSpinner={isSavingSettings}>
						Save
					</CustomButton>
				</div>
			</Form>
		);
	};

	render() {
		return (
			<div className="options-wrapper white-tab-container hb-prebid-settings">
				{Object.keys(this.state).length === 2 ? <Loader /> : this.renderForm()}
			</div>
		);
	}
}

export default PrebidSettingsTab;
