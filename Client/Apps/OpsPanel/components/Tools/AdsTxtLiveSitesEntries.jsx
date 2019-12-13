import React, { Component, Fragment } from 'react';
import {
	FormGroup,
	ControlLabel,
	FormControl,
	PanelGroup,
	Panel,
	Badge,
	Col,
	Row,
	Table
} from 'react-bootstrap';
import { CSVLink } from 'react-csv';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import omit from 'lodash/omit';

import FieldGroup from '../../../../Components/Layout/FieldGroup';
import { ADS_TXT_LIVE_SITES_ENTRIES } from '../../configs/commonConsts';
import CustomButton from '../../../../Components/CustomButton/index';
import SelectBox from '../../../../Components/SelectBox/index';
import axiosInstance from '../../../../helpers/axiosInstance';

const DEFAULT_STATE = {
	siteId: '',
	adsTxtSnippet: '',
	isLoading: false
};

class AdsTxtLiveSitesEntries extends Component {
	constructor(props) {
		super(props);

		this.state = {
			isLoading: false,
			adsTxtData: [],
			currentSelectedEntry: null,
			activeKey: null,
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

	handleSelectAccordian = (value = null) => {
		this.setState({
			activeKey: value
		});
	};

	handleReset = () => this.setState(DEFAULT_STATE);

	handleGenerate = () => {
		const { currentSelectedEntry, siteId, adsTxtSnippet } = this.state;

		const isValid = !!currentSelectedEntry;
		const { showNotification } = this.props;

		if (!isValid) {
			return showNotification({
				mode: 'error',
				title: 'Operation Failed',
				message: 'Missing or Incorrect params',
				autoDismiss: 5
			});
		}

		return axiosInstance
			.post('/adsTxt/adsTxtLiveEntries', {
				siteId,
				currentSelectedEntry,
				adsTxtSnippet
			})
			.then(res => {
				const { data } = res.data;
				this.setState({ isLoading: false, adsTxtData: data }, this.handleReset);
				return showNotification({
					mode: 'success',
					title: 'Success',
					message: `Please expand the accordian below to check the entries`,
					autoDismiss: 5
				});
			})
			.catch(err => {
				console.log(err);
				showNotification({
					mode: 'error',
					title: 'Operation Failed',
					message: 'You are probably not entering the active Site Id',
					autoDismiss: 5
				});

				this.setState({ isLoading: false });
			});
	};

	renderPanel() {
		const { activeKey, adsTxtData, currentSelectedEntry } = this.state;

		let adsData = Array.isArray(adsTxtData) ? adsTxtData : [adsTxtData];
		return (
			<PanelGroup accordion id="sites" activeKey={activeKey} onSelect={this.handleSelectAccordian}>
				<Panel eventKey="Ads.txt Entries">
					<Panel.Heading>
						<Panel.Title toggle>
							Ads.txt Entries <Badge>{adsData.length}</Badge>
						</Panel.Title>
					</Panel.Heading>
					{activeKey === 'Ads.txt Entries' ? (
						<Table striped bordered hover>
							<thead>
								<tr>
									<th>Site Id</th>
									<th>Doamin</th>
									<th>Account Email</th>
									<th>{currentSelectedEntry} </th>
								</tr>
							</thead>
							<tbody>
								{adsData.map(val => (
									<tr key={val.siteId}>
										<td>{val.siteId}</td>
										<td>{val.domain}</td>
										<td>{val.accountEmail}</td>
										<td>
											<pre>
												{currentSelectedEntry === 'All Entries Present' ||
												val.status === 1 ||
												val.status === 2 ||
												val.status === 4
													? val.message
													: val.adsTxtEntries}
											</pre>
										</td>
									</tr>
								))}
							</tbody>
						</Table>
					) : null}
				</Panel>
			</PanelGroup>
		);
	}

	render() {
		const { siteId, currentSelectedEntry, adsTxtSnippet, isLoading, adsTxtData } = this.state;
		const csvData =
			currentSelectedEntry === 'All Entries Present'
				? adsTxtData.map(data => omit(data, ['status', 'adsTxtEntries']))
				: adsTxtData.map(data => omit(data, ['status']));
		return (
			<div>
				<Row>
					<CSVLink data={csvData} filename="ads-txt.csv">
						<CustomButton
							variant="primary"
							className="btn btn-lightBg btn-default btn-blue-line pull-right u-margin-r3  "
						>
							<FontAwesomeIcon size="1x" icon="download" className="u-margin-r3" />
							Export Entries
						</CustomButton>
					</CSVLink>
				</Row>

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
					onClick={this.handleGenerate}
				>
					Generate
				</CustomButton>

				<Col xs={12} className="u-margin-t4 u-padding-l0">
					{this.renderPanel()}
				</Col>
			</div>
		);
	}
}

export default AdsTxtLiveSitesEntries;
