import React from 'react';
import { AMAZON_UAM } from '../constants';
import Loader from '../../../Components/Loader';
import InputBox from '../../../Components/InputBox';
import CustomButton from '../../../Components/CustomButton';
import CustomToggleSwitch from '../../../Components/CustomToggleSwitch';
import {
	Form,
	Col,
	FormGroup,
	ControlLabel,
	HelpBlock
} from '@/Client/helpers/react-bootstrap-imports';

import { fetchAmazonUAMSettings, updateAmazonUAMSettings } from '../../../services/hbService';

class AmazonUAMTab extends React.Component {
	state = {
		publisherId: '',
		timeOut: '',
		refreshTimeOut: '',
		isAmazonUAMActive: false,
		isSavingSettings: false,
		errors: {
			timeOut: '',
			refreshTimeOut: ''
		}
	};

	componentDidMount() {
		const { siteId } = this.props;
		fetchAmazonUAMSettings(siteId).then(amazonUAMSettings => {
			this.setState(amazonUAMSettings);
		});
	}

	handleChange = e => {
		this.setState({
			[e.target.name]: e.target.value
		});
	};

	handleToggle = (value, event) => {
		const [name] = event.target.getAttribute('name').split('-');
		if (name) {
			this.setState({
				[name]: value
			});
		}
	};

	handleTimeOutChange = ({ target: { value: timeOut } }, type) => {
		// eslint-disable-next-line no-param-reassign
		timeOut = Number(timeOut);
		let minAllowedTime = AMAZON_UAM.INITIAL_TIMEOUT.MIN;
		let maxAllowedTime = AMAZON_UAM.INITIAL_TIMEOUT.MAX;

		if (type === 'refreshTimeOut') {
			minAllowedTime = AMAZON_UAM.REFRESH_TIMEOUT.MIN;
			maxAllowedTime = AMAZON_UAM.REFRESH_TIMEOUT.MAX;
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

	saveSettings = e => {
		e.preventDefault();

		const { siteId, showNotification, setUnsavedChangesAction, customProps, user } = this.props;
		const {
			timeOut,
			publisherId,
			refreshTimeOut,
			isAmazonUAMActive,
			errors: { timeOut: timeOutError, refreshTimeOut: refreshTimeOutError }
		} = this.state;
		const dataForAuditLogs = {
			appName: customProps.appName,
			siteDomain: user.sites[siteId].domain
		};

		if (timeOutError || refreshTimeOutError || !publisherId) {
			const message = !publisherId
				? 'Publisher Id is required'
				: 'Please enter a valid Timeout value';

			return showNotification({
				mode: 'error',
				title: 'Error',
				message,
				autoDismiss: 5
			});
		}

		const confirmed = window.confirm('Are you sure?');
		if (!confirmed) return;

		const amazonUAMSettings = { publisherId, timeOut, refreshTimeOut, isAmazonUAMActive };

		this.setState({ isSavingSettings: true });
		updateAmazonUAMSettings(siteId, amazonUAMSettings, dataForAuditLogs)
			.then(() => {
				this.setState({ isSavingSettings: false }, () => {
					setUnsavedChangesAction(true);

					showNotification({
						mode: 'success',
						title: 'Success',
						message: 'Settings Saved Successfully',
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
	};

	renderForm = () => {
		const { siteId } = this.props;
		const {
			timeOut,
			refreshTimeOut,
			isSavingSettings,
			publisherId,
			isAmazonUAMActive,
			errors: { timeOut: timeOutError, refreshTimeOut: refreshTimeOutError }
		} = this.state;

		return (
			<Form onSubmit={this.saveSettings}>
				<div className="clearfix">
					<Col sm={12}>
						<CustomToggleSwitch
							labelText="Enable Amazon UAM"
							className="u-margin-b4"
							checked={isAmazonUAMActive}
							onChange={this.handleToggle}
							layout="horizontal"
							size="m"
							on="Yes"
							off="No"
							defaultLayout
							labelSize={6}
							componentSize={6}
							componentAlignment="left"
							name={`isAmazonUAMActive-${siteId}`}
							id={`js-amazon-uam-active-${siteId}`}
						/>
					</Col>
				</div>
				<FormGroup controlId="publisherId" className="form-row clearfix">
					<Col componentClass={ControlLabel} sm={6}>
						Publisher Id
					</Col>
					<Col sm={6}>
						<InputBox
							type="text"
							name="publisherId"
							value={publisherId}
							onChange={this.handleChange}
						/>
					</Col>
				</FormGroup>

				<div className="form-row clearfix">
					<Col componentClass={ControlLabel} sm={6}>
						Initial Time-Out (ms)
					</Col>
					<Col sm={6}>
						<InputBox
							type="number"
							name="amazonUAMTimeout"
							value={timeOut}
							onChange={e => this.handleTimeOutChange(e, 'timeOut')}
						/>
					</Col>
					{!!timeOutError && (
						<HelpBlock className="error-message" style={{ padding: '0 1.5rem' }}>
							{timeOutError}
						</HelpBlock>
					)}
				</div>

				<div className="form-row clearfix">
					<Col componentClass={ControlLabel} sm={6}>
						Refresh Time-Out (ms)
					</Col>
					<Col sm={6}>
						<InputBox
							type="number"
							name="amazonUAMRefreshTimeout"
							value={refreshTimeOut}
							onChange={e => this.handleTimeOutChange(e, 'refreshTimeOut')}
						/>
					</Col>
					{!!refreshTimeOutError && (
						<HelpBlock className="error-message" style={{ padding: '0 1.5rem' }}>
							{refreshTimeOutError}
						</HelpBlock>
					)}
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

export default AmazonUAMTab;
