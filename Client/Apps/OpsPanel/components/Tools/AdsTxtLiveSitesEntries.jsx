import React, { Component, Fragment } from 'react';
import { CSVLink } from 'react-csv';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
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
} from '@/Client/helpers/react-bootstrap-imports';

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
			selectedValue: '',
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

	formattedCsvData = () => {
		const { adsTxtData, selectedValue } = this.state;

		let csvData = [];
		let missingEntries = '';
		let presentEntries = '';
		adsTxtData.map(data => {
			if (selectedValue === 'Global Entries') {
				if (data.status === 2) {
					missingEntries = data.adsTxtEntries;
					presentEntries = '';
				} else if (data.status === 1) {
					missingEntries = '';
					presentEntries = data.adsTxtEntries;
				} else {
					missingEntries = data.adsTxtEntries.ourAdsTxt;
					presentEntries = data.adsTxtEntries.presentEntries;
				}
				csvData.push({
					siteId: data.siteId,
					domain: data.domain,
					accountEmail: data.accountEmail,
					missingEntries,
					presentEntries
				});
			} else if (selectedValue === 'Missing Entries') {
				csvData.push({
					siteId: data.siteId,
					domain: data.domain,
					accountEmail: data.accountEmail,
					missingEntries: data.adsTxtEntries
				});
			} else if (selectedValue === 'Present Entries') {
				presentEntries = data.adsTxtEntries;

				csvData.push({
					siteId: data.siteId,
					domain: data.domain,
					accountEmail: data.accountEmail,
					presentEntries
				});
			} else {
				csvData.push({
					siteId: data.siteId,
					domain: data.domain,
					accountEmail: data.accountEmail
				});
			}
		});
		return csvData;
	};

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

				this.setState(
					{ isLoading: false, adsTxtData: data.adsData, selectedValue: data.currentSelectedEntry },
					this.handleReset
				);
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
					message: 'Something Went Wrong',
					autoDismiss: 5
				});

				this.setState({ isLoading: false });
			});
	};

	renderPanel() {
		const { activeKey, adsTxtData, selectedValue } = this.state;
		return (
			<PanelGroup accordion id="sites" activeKey={activeKey} onSelect={this.handleSelectAccordian}>
				<Panel eventKey="Ads.txt Entries">
					<Panel.Heading>
						<Panel.Title toggle>
							Ads.txt Entries <Badge>{adsTxtData.length}</Badge>
						</Panel.Title>
					</Panel.Heading>
					{activeKey === 'Ads.txt Entries' ? (
						<Table responsive striped bordered hover>
							<thead>
								<tr>
									<th>Site Id</th>
									<th>Doamin</th>
									<th>Account Email</th>
									{selectedValue === 'No Ads.Txt Present' ||
									selectedValue === 'Global Entries' ? null : (
										<th>{selectedValue} </th>
									)}

									{selectedValue !== 'Global Entries' ? null : (
										<React.Fragment>
											<th>Missing Entries</th>
											<th>Present Entries</th>
										</React.Fragment>
									)}
								</tr>
							</thead>
							<tbody>
								{adsTxtData.map(val => (
									<tr key={val.siteId}>
										<td>{val.siteId}</td>
										<td>{val.domain}</td>
										<td>{val.accountEmail}</td>
										{selectedValue === 'No Ads.Txt Present' ||
										selectedValue === 'Global Entries' ? null : (
											<td>
												<pre style={{ fontSize: '10' }}>{val.adsTxtEntries}</pre>
											</td>
										)}

										{selectedValue !== 'Global Entries' ? null : (
											<React.Fragment>
												<td>
													{val.status === 2 ? (
														<pre style={{ fontSize: '10' }}>{val.adsTxtEntries} </pre>
													) : val.status === 1 ? (
														''
													) : (
														<pre style={{ fontSize: '10' }}>{val.adsTxtEntries.ourAdsTxt} </pre>
													)}
												</td>
												<td>
													{val.status === 2 ? (
														''
													) : val.status === 1 ? (
														<pre style={{ fontSize: '10' }}>{val.adsTxtEntries} </pre>
													) : (
														<pre style={{ fontSize: '10' }}>
															{val.adsTxtEntries.presentEntries}{' '}
														</pre>
													)}
												</td>
											</React.Fragment>
										)}
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
		const { siteId, currentSelectedEntry, adsTxtSnippet, isLoading } = this.state;

		const csvData = this.formattedCsvData();

		return (
			<div>
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
					type="text"
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
				<b>Note:</b> Ads.Txt Entries takes upto 12 hours to update.
			</div>
		);
	}
}

export default AdsTxtLiveSitesEntries;
