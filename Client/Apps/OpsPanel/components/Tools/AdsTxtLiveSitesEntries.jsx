import React, { Component, Fragment } from 'react';
import { FormGroup, ControlLabel, FormControl } from 'react-bootstrap';

import FieldGroup from '../../../../Components/Layout/FieldGroup';
import { ADS_TXT_LIVE_SITES_ENTRIES } from '../../configs/commonConsts';
import CustomButton from '../../../../Components/CustomButton/index';
import SelectBox from '../../../../Components/SelectBox/index';
import axiosInstance from '../../../../helpers/axiosInstance';

const DEFAULT_STATE = {
	siteId: '',
	emailId: '',
	adsTxtSnippet: '',
	currentSelectedEntry: null
};

class AdsTxtLiveSitesEntries extends Component {
	constructor(props) {
		super(props);

		this.state = {
			isLoading: false,
			...DEFAULT_STATE
		};
	}

	handleChange = e => {
		this.setState({
			[e.target.name]: e.target.value
		});
	};

	handleSelect = (value, key) => {
		this.setState({ [key]: value });
	};

	handleReset = () => this.setState(DEFAULT_STATE);

	handleGenerate = e => {
		e.preventDefault();
		const { emailId, currentSelectedEntry, siteId } = this.state;

		const isValid = !!(emailId && currentSelectedEntry);
		const { showNotification } = this.props;

		if (!isValid) {
			return showNotification({
				mode: 'error',
				title: 'Operation Failed',
				message: 'Missing or Incorrect params',
				autoDismiss: 5
			});
		}
	};
	render() {
		const { siteId, emailId, currentSelectedEntry, adsTxtSnippet, isLoading } = this.state;

		return (
			<form onSubmit={this.handleGenerate}>
				<Fragment>
					<p className="u-text-bold">Type Of Entries *</p>
					<SelectBox
						selected={currentSelectedEntry}
						options={ADS_TXT_LIVE_SITES_ENTRIES}
						onSelect={this.handleSelect}
						id="select-entry"
						title="Select Entry"
						dataKey="currentSelectedEntry"
						reset
					/>
				</Fragment>
				<div className="u-margin-t4">
					<FormGroup controlId="adsTxtSnippet-input">
						<ControlLabel>Ads.txt Snippet</ControlLabel>
						<FormControl
							componentClass="textarea"
							placeholder="Ads.txt Snippet"
							name="adsTxtSnippet"
							onChange={this.handleChange}
							value={adsTxtSnippet}
							className="u-padding-v4 u-padding-h4"
						/>
					</FormGroup>
				</div>
				<FieldGroup
					name="siteId"
					value={siteId}
					type="number"
					label="Site Id "
					onChange={this.handleChange}
					size={6}
					id="siteId-input"
					placeholder="Site Id"
					className="u-padding-v4 u-padding-h4"
				/>

				<FieldGroup
					name="emailId"
					value={emailId}
					type="email"
					label="Email Id *"
					onChange={this.handleChange}
					size={6}
					id="emailId-input"
					placeholder="Email Id"
					className="u-padding-v4 u-padding-h4"
				/>
				<CustomButton
					variant="secondary"
					className="pull-right u-margin-r3"
					onClick={this.handleReset}
				>
					Reset
				</CustomButton>
				<CustomButton
					type="submit"
					variant="primary"
					className="pull-right u-margin-r3"
					showSpinner={isLoading}
				>
					Generate
				</CustomButton>
			</form>
		);
	}
}

export default AdsTxtLiveSitesEntries;
