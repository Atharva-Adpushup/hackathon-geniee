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

import { fetchPrebidSettings, updateAmazonUAMSettings } from '../../../services/hbService';

class AmazonUAMTab extends React.Component {
	state = {
		publisherId: '',
		timeOut: '',
		refreshTimeOut: '',
		isSavingSettings: false
	};

	componentDidMount() {
		const { siteId } = this.props;
		fetchPrebidSettings(siteId).then(prebidSettings => {
			this.setState(prebidSettings);
		});
	}

	handleChange = e => {
		this.setState({
			[e.target.name]: e.target.value
		});
	};

	saveSettings = e => {
		e.preventDefault();
		const { siteId, showNotification, setUnsavedChangesAction } = this.props;
		const { publisherId, timeOut, refreshTimeOut } = this.state;
		if (!publisherId) {
			return showNotification({
				mode: 'error',
				title: 'Error',
				message: 'Publisher Id is required',
				autoDismiss: 5
			});
		}
		const amazonUAMSettings = { publisherId, timeOut, refreshTimeOut };

		const confirmed = window.confirm('Are you sure?');

		if (!confirmed) return;

		this.setState({ isSavingSettings: true });
		updateAmazonUAMSettings(siteId, amazonUAMSettings)
			.then(() => {
				this.setState({ isSavingSettings: false, publisherId: '' }, () => {
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
		const { timeOut, refreshTimeOut, isSavingSettings, publisherId } = this.state;

		return (
			<Form onSubmit={this.saveSettings}>
				<FormGroup controlId="pb-id" className="form-row clearfix">
					<Col componentClass={ControlLabel} sm={6}>
						Publisher Id
					</Col>
					<Col sm={6}>
						<InputBox
							type="text"
							name="publisherId"
							classNames="pb-input"
							value={publisherId}
							onChange={this.handleChange}
						/>
					</Col>
				</FormGroup>
				<div className="form-row clearfix">
					<Col componentClass={ControlLabel} sm={6}>
						Initial Time-Out (ms)
					</Col>
					<Col sm={6}>{`${timeOut} (Prebid Default)`}</Col>
				</div>

				<div className="form-row clearfix">
					<Col componentClass={ControlLabel} sm={6}>
						Refresh Time-Out (ms)
					</Col>
					<Col sm={6}>{`${refreshTimeOut} (Prebid Default)`}</Col>
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
