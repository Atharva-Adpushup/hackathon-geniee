import React, { Component } from 'react';
import PropTypes from 'prop-types';
import SelectBox from '../../../Components/SelectBox/index.jsx';
import { Row, Col } from 'react-bootstrap';
import commonConsts from '../lib/commonConsts';
import 'react-dates/initialize';
import { DateRangePicker } from 'react-dates';
import 'react-dates/lib/css/_datepicker.css';

let groupByArray = commonConsts.GROUP_BY;

class ReportControls extends Component {
	constructor(props) {
		super(props);

		this.state = {
			pageGroup: null,
			platform: null,
			variation: props.variation ? props.variation : null,
			startDate: props.startDate,
			endDate: props.endDate,
			groupBy: null,
			groupByArray
		};
		this.pageGroupUpdated = this.pageGroupUpdated.bind(this);
		this.platformUpdated = this.platformUpdated.bind(this);
		this.datesUpdated = this.datesUpdated.bind(this);
		this.focusUpdated = this.focusUpdated.bind(this);
		this.variationUpdated = this.variationUpdated.bind(this);
		this.getPageGroupName = this.getPageGroupName.bind(this);
		this.getPlatformName = this.getPlatformName.bind(this);
		this.groupByUpdated = this.groupByUpdated.bind(this);
	}

	getPageGroupName(pageGroup) {
		return pageGroup !== null ? commonConsts.PAGEGROUPS[pageGroup] : null;
	}

	getPlatformName(platform) {
		return platform !== null ? commonConsts.PLATFORMS[platform] : null;
	}

	pageGroupUpdated(pageGroup) {
		const { platform, startDate, endDate, variation, groupBy } = this.state;

		if (pageGroup !== null) {
			this.setState({ groupByArray: ['variation'] });
		} else {
			this.setState({ groupByArray: commonConsts.GROUP_BY });
		}

		this.setState({ pageGroup });
		this.props.reportParamsUpdateHandler({
			pageGroup: this.getPageGroupName(pageGroup),
			platform: this.getPlatformName(platform),
			startDate,
			endDate,
			variation,
			groupBy
		});
	}

	platformUpdated(platform) {
		const { pageGroup, startDate, endDate, variation, groupBy } = this.state;

		this.setState({ platform });
		this.props.reportParamsUpdateHandler({
			platform: this.getPlatformName(platform),
			pageGroup: this.getPageGroupName(pageGroup),
			startDate,
			endDate,
			variation,
			groupBy
		});
	}

	variationUpdated(variation) {
		const { platform, pageGroup, startDate, endDate, groupBy } = this.state;

		this.setState({ variation });
		this.props.reportParamsUpdateHandler({
			variation: variation,
			platform: this.getPlatformName(platform),
			pageGroup: this.getPageGroupName(pageGroup),
			startDate,
			endDate,
			groupBy
		});
	}

	datesUpdated({ startDate, endDate }) {
		const { pageGroup, platform, variation, groupBy } = this.state;

		this.setState({ startDate, endDate });
		this.props.reportParamsUpdateHandler({
			startDate,
			endDate,
			variation,
			groupBy,
			pageGroup: this.getPageGroupName(pageGroup),
			platform: this.getPlatformName(platform)
		});
	}

	groupByUpdated(groupBy) {
		const { pageGroup, platform, variation, startDate, endDate } = this.state;

		this.setState({ groupBy: groupBy });
		this.props.reportParamsUpdateHandler({
			startDate,
			endDate,
			variation,
			groupBy,
			pageGroup: this.getPageGroupName(pageGroup),
			platform: this.getPlatformName(platform)
		});
	}

	focusUpdated(focusedInput) {
		this.setState({ focusedInput });
	}

	render() {
		const { state, props } = this,
			{ PLATFORMS, PAGEGROUPS } = commonConsts;

		return (
			<div className="report-controls-wrapper">
				<div className="container-fluid">
					<Row>
						<Col sm={2}>
							<SelectBox
								value={state.pageGroup}
								label="Select PageGroup"
								onChange={this.pageGroupUpdated}
							>
								{PAGEGROUPS.map((pageGroup, index) => (
									<option key={index} value={index}>
										{pageGroup}
									</option>
								))}
							</SelectBox>
						</Col>
						<Col sm={2}>
							<SelectBox value={state.platform} label="Select Platform" onChange={this.platformUpdated}>
								{PLATFORMS.map((platform, index) => (
									<option key={index} value={index}>
										{platform}
									</option>
								))}
							</SelectBox>
						</Col>
						<Col sm={2}>
							<SelectBox
								value={state.variation}
								label="Select Variation"
								onChange={this.variationUpdated}
								disabled={!props.variations || !props.variations.length}
							>
								{props.variations.map((variation, index) => (
									<option key={index} value={variation.id}>
										{variation.name}
									</option>
								))}
							</SelectBox>
						</Col>
						<Col sm={4}>
							<DateRangePicker
								onDatesChange={this.datesUpdated}
								onFocusChange={this.focusUpdated}
								focusedInput={state.focusedInput}
								startDate={state.startDate}
								endDate={state.endDate}
								showDefaultInputIcon={true}
								hideKeyboardShortcutsPanel={true}
								showClearDates={true}
								minimumNights={0}
								displayFormat={'DD-MM-YYYY'}
								isOutsideRange={() => {}}
							/>
						</Col>
						<Col sm={2}>
							<SelectBox value={state.groupBy} label="Group By" onChange={this.groupByUpdated}>
								{state.groupByArray.map((groupBy, index) => (
									<option key={index} value={groupBy}>
										{groupBy}
									</option>
								))}
							</SelectBox>
						</Col>
					</Row>
					<Row className="mT-10">
						<Col sm={3} smOffset={9}>
							<button
								className="btn btn-lightBg btn-default"
								onClick={props.generateButtonHandler}
								disabled={props.disableGenerateButton}
							>
								Generate Report
							</button>
						</Col>
					</Row>
				</div>
			</div>
		);
	}
}

ReportControls.propTypes = {
	startDate: PropTypes.object.isRequired,
	endDate: PropTypes.object.isRequired,
	disableGenerateButton: PropTypes.bool.isRequired,
	generateButtonHandler: PropTypes.func.isRequired,
	reportParamsUpdateHandler: PropTypes.func.isRequired,
	variations: PropTypes.array.isRequired
};

export default ReportControls;
