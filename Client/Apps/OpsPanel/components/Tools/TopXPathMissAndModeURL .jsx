import React, { Component, Fragment } from 'react';
import { Col, Row } from 'react-bootstrap';
import FieldGroup from '../../../../Components/Layout/FieldGroup';
import moment from 'moment';
import { Table } from 'react-bootstrap';
import CustomToggleSwitch from '../../../../Components/CustomToggleSwitch/index';
import CustomButton from '../../../../Components/CustomButton/index';
import Loader from '../../../../Components/Loader/index';
import SelectBox from '../../../../Components/SelectBox/index';
import axiosInstance from '../../../../helpers/axiosInstance';
import 'react-dates/initialize';
import { DateRangePicker } from 'react-dates';
import 'react-dates/lib/css/_datepicker.css';

// import { getPresets } from  '../../../Reporting/helpers/utils';
// import PresetDateRangePicker from '../../../../Components/PresetDateRangePicker/index';

class TopXPathMissAndModeURL extends Component {
	constructor(props) {
		super(props);

		const devices = [
			{ name: 'Desktop', value: 'Desktop' },
			{ name: 'Mobile', value: 'Mobile' },
			{ name: 'Tablet', value: 'Tablet' }
		];

		const modes = [{ name: 'Mode 1', value: 'Mode 1' }, { name: 'Mode 2', value: 'Mode 2' }];

		this.state = {
			siteId: '',
			topURLCount: '',
			emailId: '',
			pageGroups: '',
			devices,
			modes,
			currentSelcted: null,
			errorCode: '',
			loading: false,
			startDate: moment()
				.subtract(7, 'days')
				.startOf('day'),
			endDate: moment()
				.startOf('day')
				.subtract(1, 'day'),
				focusedInput: null
		};
	}

	handleChange = e => {
		this.setState({
			[e.target.name]: e.target.value
		});
	};

	handleSelect = value => this.setState({ currentSelcted: value });

	handleGenerate = () => {};

	handleReset = () => {
		this.setState({
			siteId: '',
			topURLCount: '',
			emailId: '',
			pageGroups: '',
			errorCode: ''
		});
	};

	datesUpdated({ startDate, endDate }) {
		this.setState({ startDate, endDate });
	}

	focusUpdated(focusedInput) {
		this.setState({ focusedInput });
	}

	render() {
		const {
			siteId,
			topURLCount,
			emailId,
			devices,
			currentSelcted,
			pageGroups,
			modes,
			errorCode,
			loading
		} = this.state;

		if (loading) return <Loader height="250px" />;

		return (
			<Row className="row">
				<Col xs={12} style={{ margin: '0 auto' }}>
					<FieldGroup
						name="siteId"
						value={siteId}
						type="text"
						label="Site Id"
						onChange={this.handleChange}
						size={6}
						id="siteId-input"
						placeholder="Site Id"
						className="u-padding-v4 u-padding-h4"
					/>
				</Col>
				<Col xs={12} style={{ margin: '0 auto' }}>
					<FieldGroup
						name="topURLCount"
						value={topURLCount}
						type="text"
						label="Top URL Count"
						onChange={this.handleChange}
						size={6}
						id="topURLCount-input"
						placeholder="Top URL Count"
						className="u-padding-v4 u-padding-h4"
					/>
				</Col>

			 <Col xs ={12} style = {{ margin : '0 auto'}}>
				<label className="u-text-bold">Dates</label>
				<DateRangePicker
						onDatesChange={this.datesUpdated}
						onFocusChange={this.focusUpdated}
						focusedInput={this.state.focusedInput}
						startDate={this.state.startDate}
						endDate={this.state.endDate}
						showDefaultInputIcon={true}
						hideKeyboardShortcutsPanel={true}
						showClearDates={true}
						minimumNights={0}
						displayFormat={'DD-MM-YYYY'}
						isOutsideRange={() => {}}
					/>
				</Col>

				<Col xs={12} style={{ margin: '0 auto' }}>
					<FieldGroup
						name="emailId"
						value={emailId}
						type="text"
						label="Email Id"
						onChange={this.handleChange}
						size={6}
						id="emailId-input"
						placeholder="Email Id"
						className="u-padding-v4 u-padding-h4"
					/>
				</Col>
				<Col xs={12} style={{ margin: '0 auto' }}>
					<Fragment>
						<p className="u-text-bold">Device</p>
						<SelectBox
							selected={currentSelcted}
							options={devices}
							onSelect={this.handleSelect}
							id="select-device"
							title="Select Device"
						/>
					</Fragment>
				</Col>

				<Col xs={12} style={{ margin: '0 auto', marginTop: '2rem' }}>
					<FieldGroup
						name="pageGroups"
						value={pageGroups}
						type="text"
						label="Page Groups"
						onChange={this.handleChange}
						size={6}
						id="pageGroups-input"
						placeholder="Page Groups"
						className="u-padding-v4 u-padding-h4"
					/>
				</Col>

				<Col xs={12} style={{ margin: '0 auto' }}>
					<Fragment>
						<p className="u-text-bold">Mode</p>
						<SelectBox
							selected={currentSelcted}
							options={modes}
							onSelect={this.handleSelect}
							id="select-mode"
							title="Select Mode"
						/>
					</Fragment>
				</Col>

				<Col xs={12} style={{ margin: '0 auto', marginTop: '2rem' }}>
					<FieldGroup
						name="errorCode"
						value={errorCode}
						type="text"
						label="Error Code"
						onChange={this.handleChange}
						size={6}
						id="erroCode-input"
						placeholder="Error Code"
						className="u-padding-v4 u-padding-h4"
					/>
				</Col>

				<Col xs={12} style={{ margin: '0 auto' }}>
					<CustomButton
						variant="primary"
						className="pull-right u-margin-r3"
						onClick={this.handleGenerate}
					>
						Generate
					</CustomButton>

					<CustomButton
						variant="secondary"
						className="pull-right u-margin-r3"
						onClick={this.handleReset}
					>
						Reset
					</CustomButton>
				</Col>
			</Row>
		);
	}
}

export default TopXPathMissAndModeURL;
