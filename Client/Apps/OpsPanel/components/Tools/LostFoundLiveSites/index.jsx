import React, { Component, Fragment } from 'react';
import { PanelGroup, Panel, Col, Badge, Row } from 'react-bootstrap';
import moment from 'moment';
import 'react-dates/initialize';
import { DateRangePicker } from 'react-dates';
import { isInclusivelyBeforeDay } from 'react-dates';
import 'react-dates/lib/css/_datepicker.css';
import LostSites from './LostSites';
import NewSites from './NewSites';
import RetentionSites from './RetentionSites';
import CustomButton from '../../../../../Components/CustomButton/index';
import Loader from '../../../../../Components/Loader/index';
import axiosInstance from '../../../../../helpers/axiosInstance';

class LostFoundLiveSites extends Component {
	constructor(props) {
		super(props);

		const currentFrom = moment()
			.subtract(7, 'days')
			.startOf('day');

		const CurrentTo = moment()
			.subtract(1, 'days')
			.startOf('day');

		const LastFrom = moment()
			.subtract(14, 'days')
			.startOf('day');

		const lastTo = moment()
			.subtract(8, 'days')
			.startOf('day');

		this.state = {
			activeKey: null,
			lastStartDate: LastFrom,
			lastEndDate: lastTo,
			currentStartDate: currentFrom,
			currentEndDate: CurrentTo,
			focusedInput: null,
			currentFocusedInput: null,
			isLoading: false,
			pageviewsThreshold: 10000,
			sitesData: {
				lost: [],
				won: [],
				rentention: []
			},
			numberOfDays: 7
		};
	}

	handleSelect = (value = null) => {
		this.setState({
			activeKey: value
		});
	};

	datesUpdated = ({ startDate, endDate }) => {
		this.setState({ lastStartDate: startDate, lastEndDate: endDate });
	};

	currentDatesUpdated = ({ startDate, endDate }) => {
		this.setState({ currentStartDate: startDate, currentEndDate: endDate });
	};

	focusUpdated = focusedInput => {
		this.setState({ focusedInput });
	};

	currentFocusUpdated = currentFocusedInput => {
		this.setState({ currentFocusedInput });
	};

	handleGenerate = () => {
		const {
			currentStartDate,
			currentEndDate,
			pageviewsThreshold,

			numberOfDays
		} = this.state;

		const { showNotification } = this.props;

		if (pageviewsThreshold < 10000) {
			return showNotification({
				mode: 'error',
				title: 'Operation Failed',
				message: 'Page Views Should not be less than 10,000 ',
				autoDimiss: 5
			});
		}

		const qs = {
			pageviewsThreshold,
			current: {
				from: currentStartDate,
				to: currentEndDate
			},
			numberOfDays
		};

		this.setState({ isLoading: true });
		axiosInstance
			.get('/ops/getSiteStats', {
				params: {
					params: window.btoa(JSON.stringify(qs))
				}
			})
			.then(res => {
				this.setState({ sitesData: res.data.data, isLoading: false });
			})
			.catch(err => {
				this.setState({ isLoading: false });
				console.log(err);
			});
	};

	renderHeader() {
		const {
			currentStartDate,
			currentEndDate,
			currentFocusedInput,
			pageviewsThreshold
		} = this.state;

		return (
			<Row>
				<Col sm={12}>
					<Col sm={6} style={{ textAlign: 'center' }}>
						<p className="h3">Page Views</p>
						<label>{pageviewsThreshold}</label>
					</Col>
					<Col sm={6}>
						<Fragment>
							<p className="u-text-bold u-margin-t4">Select Date Range</p>

							<DateRangePicker
								startDate={currentStartDate}
								endDate={currentEndDate}
								onDatesChange={this.currentDatesUpdated}
								focusedInput={currentFocusedInput}
								onFocusChange={this.currentFocusUpdated}
								showDefaultInputIcon
								hideKeyboardShortcutsPanel
								showClearDates
								minimumNights={0}
								displayFormat="DD-MM-YYYY"
								isOutsideRange={day => !isInclusivelyBeforeDay(day, currentEndDate)}
							/>
						</Fragment>

						<CustomButton
							variant="primary"
							className="pull-right u-margin-r3"
							onClick={this.handleGenerate}
						>
							Generate
						</CustomButton>
					</Col>
				</Col>
			</Row>
		);
	}

	renderPanel() {
		const { activeKey, sitesData } = this.state;

		return (
			<PanelGroup accordion id="sites" activeKey={activeKey} onSelect={this.handleSelect}>
				<Panel eventKey="lost">
					<Panel.Heading>
						<Panel.Title toggle>
							Lost <Badge> {sitesData.lost.length} </Badge>
						</Panel.Title>
					</Panel.Heading>
					{activeKey === 'lost' ? <LostSites data={sitesData.lost} /> : null}
				</Panel>

				<Panel eventKey="new">
					<Panel.Heading>
						<Panel.Title toggle>
							New <Badge> {sitesData.won.length} </Badge>
						</Panel.Title>
					</Panel.Heading>
					{activeKey === 'new' ? <NewSites data={sitesData.won} /> : null}
				</Panel>

				<Panel eventKey="retention">
					<Panel.Heading>
						<Panel.Title toggle>
							Retention <Badge>{sitesData.rentention.length}</Badge>
						</Panel.Title>
					</Panel.Heading>
					{activeKey === 'retention' ? <RetentionSites data={sitesData.rentention} /> : null}
				</Panel>
			</PanelGroup>
		);
	}

	render() {
		const { isLoading } = this.state;

		if (isLoading) return <Loader height="100px" classNames="u-margin-v3" />;
		return (
			<div>
				<Col className="u-margin-b4" xs={12}>
					{this.renderHeader()}
				</Col>

				<Col xs={12}>{this.renderPanel()}</Col>
			</div>
		);
	}
}

export default LostFoundLiveSites;
