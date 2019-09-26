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

	handleFormats = formats => {
		this.setState({ formats });
	};

	savePrebidSettings = e => {
		e.preventDefault();
		// eslint-disable-next-line no-alert
		const confirmed = window.confirm('Are you sure?');

		if (!confirmed) return;

		const { siteId, showNotification, setUnsavedChangesAction } = this.props;
		const { timeOut, formats } = this.state;

		if (
			!Number.isNaN(timeOut) &&
			timeOut >= 500 &&
			timeOut <= 10000 &&
			formats.indexOf('display') > -1
		) {
			const newPrebidSettings = { timeOut, formats };

			this.setState({ isSavingSettings: true });
			updatePrebidSettings(siteId, newPrebidSettings)
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
			currency: { code: currencyCode },
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
						Time-Out (ms)
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
			<div className="options-wrapper white-tab-container hb-prebid-settings">
				{Object.keys(this.state).length === 2 ? <Loader /> : this.renderForm()}
			</div>
		);
	}
}

export default PrebidSettingsTab;
