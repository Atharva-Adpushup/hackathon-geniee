import React from 'react';
import {
	Row,
	Form,
	Col,
	FormGroup,
	ControlLabel,
	HelpBlock,
	Radio,
	ButtonToolbar,
	ToggleButtonGroup,
	Checkbox
} from 'react-bootstrap';
import InputBox from '../../../Components/InputBox';
import CustomButton from '../../../Components/CustomButton';
import Loader from '../../../Components/Loader';
import { fetchPrebidSettings, updatePrebidSettings } from '../../../services/hbService';

class PrebidSettingsTab extends React.Component {
	state = {
		errors: { timeOut: '' },
		isSavingSettings: false
	};

	componentDidMount() {
		const { siteId } = this.props;
		fetchPrebidSettings(siteId).then(prebidSettings => {
			this.setState(prebidSettings);
		});
	}

	handleTimeOut = ({ target: { value: timeOut } }) => {
		// eslint-disable-next-line no-param-reassign
		timeOut = Number(timeOut);

		this.setState(state => ({
			timeOut,
			errors: {
				...state.errors,
				timeOut: !(!Number.isNaN(timeOut) && timeOut > 500 && timeOut < 10000)
					? 'Timeout should be between 500ms to 10000ms'
					: ''
			}
		}));
	};

	handleCurrencyConversion = enabled => {
		this.setState(state => ({ currency: { ...state.currency, enabled } }));
	};

	handleFormats = formats => {
		this.setState({ formats });
	};

	savePrebidSettings = e => {
		e.preventDefault();
		const confirmed = window.confirm('Are you sure?');

		if (!confirmed) return;

		const { siteId, showNotification } = this.props;
		const { timeOut, currency, formats } = this.state;

		if (
			!Number.isNaN(timeOut) &&
			timeOut >= 500 &&
			timeOut <= 10000 &&
			typeof currency.enabled === 'boolean' &&
			formats.indexOf('display') > -1
		) {
			const newPrebidSettings = { timeOut, currency, formats };
			delete newPrebidSettings.currency.code;

			this.setState({ isSavingSettings: true });
			updatePrebidSettings(siteId, newPrebidSettings)
				.then(() => {
					this.setState({ isSavingSettings: false }, () => {
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
			currency: { enabled: currencyConversion, code: currencyCode },
			formats,
			availableFormats,
			adServer,
			errors: { timeOut: timeOutError },
			isSavingSettings
		} = this.state;

		return (
			<Form onSubmit={this.savePrebidSettings}>
				<FormGroup controlId="pb-timeout" className="form-row clearfix">
					<Col componentClass={ControlLabel} sm={6}>
						Time-Out (mS)
					</Col>
					<Col sm={6}>
						<InputBox
							type="number"
							name="pb-timeout"
							classNames="pb-input"
							value={timeOut}
							onChange={this.handleTimeOut}
						/>
					</Col>
					{!!timeOutError && <HelpBlock>{timeOutError}</HelpBlock>}
				</FormGroup>

				<FormGroup controlId="pb-currency-conversion" className="form-row clearfix">
					<Col componentClass={ControlLabel} sm={6}>
						Currency Conversion
					</Col>
					<Col sm={6}>
						<ButtonToolbar>
							<ToggleButtonGroup
								type="radio"
								name="currency-conversion"
								defaultValue={currencyConversion}
								onChange={this.handleCurrencyConversion}
							>
								<Radio value inline>
									Enable
								</Radio>
								<Radio value={false} inline>
									Disable
								</Radio>
							</ToggleButtonGroup>
						</ButtonToolbar>
					</Col>
				</FormGroup>

				<Row className="form-row">
					<Col componentClass={ControlLabel} sm={6}>
						AdServer
					</Col>
					<Col sm={6}>{adServer}</Col>
				</Row>

				<Row className="form-row">
					<Col componentClass={ControlLabel} sm={6}>
						AdServer Currency
					</Col>
					<Col sm={6}>{currencyCode || 'N/A'}</Col>
				</Row>

				<FormGroup controlId="pb-formats" className="form-row clearfix">
					<Col componentClass={ControlLabel} sm={6}>
						Formats
					</Col>
					<Col sm={6}>
						<ButtonToolbar>
							<ToggleButtonGroup
								type="checkbox"
								defaultValue={formats}
								onChange={this.handleFormats}
							>
								{availableFormats.map(formatObj => (
									<Checkbox
										key={formatObj.value}
										value={formatObj.value}
										inline
										disabled={formatObj.value === 'display'}
									>
										{formatObj.name}
									</Checkbox>
								))}
							</ToggleButtonGroup>
						</ButtonToolbar>
					</Col>
				</FormGroup>

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
			<div className="options-wrapper hb-prebid-settings">
				{Object.keys(this.state).length === 2 ? <Loader /> : this.renderForm()}
			</div>
		);
	}
}

export default PrebidSettingsTab;
